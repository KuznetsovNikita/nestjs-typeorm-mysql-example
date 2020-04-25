# Nest.js + TypeORM + Typescript + MySQL

### Build Commands

``` bash
# install dependencies
npm install

# create test database and test user or you could change ormconfig for fix connection
mysql -u root -p < ./res/create-testdb.sql

# run migrations
npm run migration:run

# run test
npm run test:e2e

# run lint
npm run lint

# start project
npm start
```

### Requrements

Language – typescript,
Framework - NestJS,
Base - Mysql,
Orm - typeorm.

Acknowledgments received by users are stored in the database table. The service receives from `(string (16))` - id from whom the gratitude was received (may be `null`), to `(string (16))` - who the recipient is (always is) and reason `(string)` - arbitrary text information with details of gratitude.

To save in the table, the architect chose a special scheme: the primary key in the table is composite: first, the recipient’s id, then the separator `#` and then the serial number with the left padding up to 6 characters (for example, `abcxyz0203040506#000004` - 4th thanks to the user `abcxyz0203040506`). The rest of the data is stored as usual in the fields of the table.

Two endpoints must be implemented: list and add.

List receives the id of the recipient user and returns a list of thanks from the most recent to the oldest. Pagination is provided using the cursor: two options for query parameters are possible:
`?id=abcxyz0203040506&perPage=20` - requests the first page of results and determines that each page contains 20 entries.
`?cursor=oeufgwneiucgo2bitroibuwqnvqvowiytnqvoerym` - requests the next page of results for the same parameters.

The answer is in the format `{total: 234, nextCursor: 'oeufgwneiucgo2bitroibuwqnvqvowiytnqvoerym', items: [{from: '', reason: ''}, {from: '', reason: ''}]}`.

If the data page is the last, the client receives a response with `nextCursor:null` or without it at all.

It is known in advance that the client is developed by junior developers. If an incorrectly programmed client sends id and perPage along with cursor, they should be ignored. Also, the cursor must have a format that allows it to be included in the request url without url-encoding - the jones constantly forget about `encodeURIComponent`. :)

The second endpoint add receives POST with json-body of the form `{from: 'xxx', to: 'yyy', reason: 'blah'}`, and it is believed that from and to are already validated at a higher level and are fully valid identifiers of real ones in user system. From may be `null`.

Add should exclude the possibility of race condition when adding records.

The remaining implementation details are up to the developer. It is advisable to use standard framework tools where possible.
