- Webhooks and polling are two ways for a client to learn about changes on a server.

- With polling, the client repeatedly asks the server whether anything has changed, so it controls the request  rate but wastes calles when nothing is new and only sees a change on its next check.

- With webhooks, the server sends an HTTP request to a URL the client regiestered as soon as an event happens, which is faster and cheaper but requires the receiver to be publicly reachable and to handle delivery problems.

- Webhook delivery is usually at-least-once, so events can arrive more than once or out of order: receivers should verify each request's signature ( typically an HMAC of the payload using a shared secret ), respond quickly with a 2xx status and process the event in the background, and ignore events whose ID they have already handled.

1- What is polling? 
    - Polling, also known as API polling, is when a client makes recurring calles to a specific API endpoint. 
    - The calles are typically repeated on a time-based cadence, such as every hour.
    - An analogy here is that you're waiting to meet your friend at coffee, and you're texting your friend every hour to see where they are. ( Example ).

    => Pros of polling:-
        - Availability: As long as the application provides the API endpoint you need, you should be able to implement polling.
        - Data freshness: While data isn't updated in real-time, it can be relatively fresh if the sync frequency is set to an aggressive level. ( e.g. every 5 minutes )
        - Flexibility: You can customize the sync frequency based on how often you need updated data. For instance, API polling can be as frequent as every minute or as infrequent as every 24 hours.

    => Cons of polling:-
        - No real-time data: In many cases, your team needs to access and act on data in real-time to realize the full potential value from it ( or get any value )
        - Wasteful: The vast majority of your API calls will return back data that hasn't changed - but you'll still have to pay the provider for making those calls
        - Unadaptable: The requency in which data gets updated on the server side can vary, depending on the time of the day, week, month, or year. Polling can't accommodate these trends.

    => When to use:-
        - If you don't need extremely fresh data and updates are very frequent, polling is the best solution for you.
        
---------------------------------------------------------------------------------------------------------------

2- What is a webhook?
    - A webhook, also known as a reverse API, allows an application to get notified of an event as soon as it occurs.
    - An analogy here is that you're waiting to meet your friend at coffee, and instead of texting your friend every hour to see where they are, you wait fro your friend to text you.

    => Pros of webhooks:-
        - Real-time data: Your team can access and act on time-sensitive data.
        - Cost-effective: You no longer have to make excessive API calls; you'll simply get the information you need when it's available.
        - Customizable: You can add conditions to an event to better control the messages you receive.

    => Const of webhooks:-
        - Unavailable: Many applications don't support webhooks.
        - Unreliable: When the application with the registered webhook is down, any events that take place may fail to get accounted for any communicated back to the receiving applications.
        - Limited functionality: They only data to be sent from one application to another. ( the don't allow for bidirectional syncs or for you to perform HTTP methods like PATCH of DELETE).

    => When to use:-
        - You need extremely fresh data.
        - The updates are not frequent.
        - For example, if you are a recruiting product that flags when applications have been deleted.