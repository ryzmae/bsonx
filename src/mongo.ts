import {
  Db,
  MongoClient,
  type OptionalUnlessRequiredId,
  type Document,
  type Collection,
} from "mongodb"
import { compileMatch } from "./compile"
import type { Expr } from "./expr"

export class MongoDB {
  private client: MongoClient
  private db: Db

  constructor(uri: string, dbName: string) {
    this.client = new MongoClient(uri)
    this.db = this.client.db(dbName)
  }

  async connect() {
    await this.client.connect()
    return this
  }

  collection<T extends Document>(name: string) {
    const col: Collection<T> = this.db.collection<T>(name)

    return {
      find: (expr?: Expr, options?: any) =>
        col.find(expr ? compileMatch(expr) : {}, options).toArray(),

      findOne: (expr: Expr, options?: any) =>
        col.findOne(compileMatch(expr), options),

      update: (expr: Expr, update: any) =>
        col.updateMany(compileMatch(expr), update),

      insert: (doc: OptionalUnlessRequiredId<T>) => col.insertOne(doc),
    }
  }
}
