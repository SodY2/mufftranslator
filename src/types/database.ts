export type SQLiteResultRow = [
  number, // id
  string, // name
  string, // created_at
]

export interface SQLiteExecResult {
  dbId: string
  sql: string
  returnValue: 'resultRows'
  resultRows: SQLiteResultRow[]
}

export interface SQLiteResponse {
  type: 'exec'
  dbId: string
  messageId: string
  workerReceivedTime: number
  workerRespondTime: number
  departureTime: number
  result: SQLiteExecResult
}

// Add this interface for better readability when working with the data
export interface TestTableRow {
  id: number
  name: string
  created_at: string
}

// Add a utility function to convert the row tuple to an object
export function convertRowToTestTable(row: SQLiteResultRow): TestTableRow {
  return {
    id: row[0],
    name: row[1],
    created_at: row[2],
  }
}
