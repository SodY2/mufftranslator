import type { TestTableRow } from '@/types/database'
import { sqliteService } from '@/services/sqlite'

export class TestTableRepository {
  async initialize(): Promise<boolean> {
    return await sqliteService.initialize()
  }

  async getAll(): Promise<TestTableRow[]> {
    const result = await sqliteService.getData()
    return result.map(row => ({
      id: row[0],
      name: row[1],
      created_at: row[2],
    }))
  }

  async create(name: string): Promise<void> {
    await sqliteService.insertData(name)
  }
}

export const testTableRepository = new TestTableRepository() 