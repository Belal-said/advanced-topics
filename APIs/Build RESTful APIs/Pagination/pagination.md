Why Paginate?
    => GET /orders, on a table with 5 million rows would return a very large response. 
    - That means slow queries.
    - High memory use on both ends.
    - Timeouts and wasted bandwidth.
    - Client probably only shows 20 rows anyway.

Pagination means the server returns one slice at a time and tells the client how to get the next slice.

Different types of pagination:-
    1- Limit-Offset ( page-based ) => 
        - GET /api/products?limit=20&offset=40
        - GET /api/products?page=3&per_page=20

        - SELECT * FROM products ORDER BY id LIMIT 20 OFFSET 40;

        {
            "data": [... 20 items ...],
            "pagination": {
                "limit": 20,
                "offset": 40,
                "total": 1543
            }
        }
         
        - Pros
            - Easy to build and understand
            - Clients can jump straight to any page ( go to page 37 )
            - A total count makes "Page 3 of 78" UIs possible.

        - Cons
            - Slow on deep pages. OFFSET 1000000 still makes the database scan and throw away a million rows.
            - Results shift when data changes. if a row is inserted while someone is on page 2, page 3 repeats an item.
            - COUNT(*) on large tables is expensive

        - Can be used with admin tables, small or medium datasets, and UIs with numbered pages.

    -------------------------------------------------------------------------

    2- Cursor-based ( Keyset )
        - Instead of saying "skip N rows", "the client says" give me rows after this one. "The server reteurns on opaque cursor that marks the last page ended

        - GET /api/products?limit=20
        - GET /api/products?limit=20&cursor=eyJpZCI6MTIzNH0

        - The cursor is often base64-encoded JSON such as { "id":1234 }. The server decodes it.
        - SELECT * FROM products
        WHERE id > 1234
        ORDER BY id
        LIMIT 20;
        
        {
            "data": [ ... ],
            "pagination":{
                "next_cursor": "eyJpZCI6MTIzNH0",
                "has_more": true
            }
        }

        - Pros
            - Fast at any depth. WHERE id > x uses an index, so page 50000 is as quick as page 1.
            - Stable. Inserts and deletes don't cause duplicates or skipped items.
            - Good fit for real-time feeds

        - Cons 
            - No jumping to an arbitrary page, only next ( and sometimes pervious )
            - Harder to build when sorting by a non-unique column. For example, sorting by price needs a tie-breaker, useing WHERE (price, id) > (9.99, 1234)
            - Total counts usually aren't available cheaply

        - Use it for: infinite scroll, activity feeds, large or fast-changing datasets, and public APIs. Stripe, Slack, GitHub GraphQL, Twitter/X and Facebook all use cursor.

    -------------------------------------------------------------------------

    3- Time-based 
        - This is a special case of keyset pagination where the key is a timestamp

        - GET /api/events?since=2026-10-01T00:00:00Z&limit=100
        - GET /api/events?before=2026-10-31T12:00:00Z&limit=100

        - SELECT * FROM events
        WHERE created_at > '2026-10-01T00:00:00Z'
        ORDER BY created_at
        LIMIT 100;

        - Pros 
            - Easy to understand
            - Well suited to logs
        
        - Cons 
            - Two records can share the same timestamp, which causes duplicates or missed items at page boundaries. 
            - Can fix this by adding a tie-breaker (created_at, id).

        - Use it for: events streams, audit logs and incremental sync.

----------------------------------------------------------------------------------------------------------------------------------------

=> Design best practices
    1- Always paginate list endpoints, even small ones, because collections grow. Adding pagination later is a breaking change.
    2- Set a default and a maximum limit, for example default=20, max=100, so nobody can request limit=1000000
    3- Always use a deterministic sort, ending in a unique column such as ORDER BY created_at DESC, id DESC. Without one, page boundaries are random
    4- Return navigation info. Either put it in a body or use the standard HTTP Link header
        - body 
            "links": {
                "self": "/api/products?cursor=abc",
                "next": "/api/products?cursor=def",
                "prev": null
            }
        - Link header
            Link: </api/products?page=4>; rel="next", </api/products?page=78>; rel="last"
    5- Use consistent envelope across all endpoints, such as data + pagination/meta + links, so client can write one generic pager.
    6- Make total optional or cheap. Skip it, estimate it, or let clients opt in with ?include_total+true
    7- Keep filters inside the cursor, or validate that they don't change between pages. Otherwise a cursor from ?status=active gets reused with ?status=archived

    ---------------------------------------------------------------------------------------------------------------------------------------

    Quick rule of thumb
        - Need numbered pages and the dataset is modest? => Use limit-offset
        - Large, growing or live data, or a public API? => Use cursor-based
        - Syncing or streaming events over time? => Use time-based, with an id tie-breaker.