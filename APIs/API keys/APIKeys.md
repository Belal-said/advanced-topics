What an API key is => 
    - An API key is a long random string that identifies you to a service. 
    - You send it with each request, and the service uses it to:-
        - Know who's calling, so it can tie requests to your account.
        - Enforce limits, for example "1000 requests per day on the free tier"
        - Bill you on paid plans.
        - Block you if you abuse it, or if you revoke the key yourself.

- It works like a library card more than a password. It shows which account is making the request, but it usually dooesn't prove which person is.

1- Consuming and protecting API keys
    1- Where keys live?