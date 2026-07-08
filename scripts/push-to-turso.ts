import { createClient } from '@libsql/client'
import fs from 'fs'

const sql = fs.readFileSync('turso-migration.sql', 'utf8')

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function main() {
  const exists = await client.execute("SELECT name FROM sqlite_master WHERE type='table'")
  if (exists.rows.length > 0) {
    console.log('Tables already exist:', exists.rows.map((r: any) => r.name).join(', '))
  } else {
    await client.executeMultiple(sql)
    console.log('Schema pushed to Turso')
  }
  client.close()
}

main().catch((e) => { console.error(e.message); process.exit(1) })
