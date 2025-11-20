import { createHash } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DistributedLockService {
  private readonly logger = new Logger(DistributedLockService.name);

  constructor(private readonly dataSource: DataSource) {}

  async withLock<T>(lockName: string, callback: () => Promise<T>): Promise<T | undefined> {
    const [key1, key2] = this.buildKeys(lockName);
    const [{ acquired } = { acquired: false }] = await this.dataSource.query(
      'SELECT pg_try_advisory_lock($1, $2) AS acquired',
      [key1, key2],
    );

    if (!acquired) {
      this.logger.debug(`Skipped ${lockName} execution because another worker holds the lock`);
      return undefined;
    }

    try {
      return await callback();
    } finally {
      await this.dataSource.query('SELECT pg_advisory_unlock($1, $2)', [key1, key2]);
    }
  }

  private buildKeys(lockName: string): [number, number] {
    const digest = createHash('sha256').update(lockName).digest();
    return [digest.readInt32BE(0), digest.readInt32BE(4)];
  }
}
