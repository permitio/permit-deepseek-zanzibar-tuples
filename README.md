# Relationship tuple generator with DeepSeek R1 and Permit

Use the latest DeepSeek R1 model to generate relationship tuples from simple English sentences and sync them with Permit.

## How to run the code

Clone the project using the `git clone` command

Open the project on your terminal and run:

```sh
nodemon index.js
```

## Example

```sh
curl -H 'Content-Type: application/json' -d '{"text": "The enterprise sales team manages all enterprise-level accounts."}' -X POST http://localhost:3000/generate-rebac
```

### Result

```json
"rebacTuple": {
    "subject": "team:enterprise_sales",
    "relation": "manages",
    "object": "account:enterprise",
    "attributes": {
        "level": "enterprise"
    }
}
```
