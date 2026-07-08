import { createClient } from '@libsql/client'
import fs from 'fs'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const sql = fs.readFileSync('turso-schema.sql', 'utf8')
await client.executeMultiple(sql)
console.log('Schema pushed to Turso')
client.close()
