# Relationship tuple generator with DeepSeek R1 and Permit

Use the latest DeepSeek R1 model to generate relationship tuples from simple English sentences and sync them with Permit.

## Prequesits
To test the project, you need to open free accounts in Nebius and Permit.io

1. [Nebius AI Studio](https://docs.nebius.com/studio/inference/quickstart) API key
2. Permit [API token](https://app.permit.io/)

## How to run the code

1. Clone the project using the `git clone` command

2. Set Nebius API key and Permit API key as environment variables in a `.env` file
    ```
    NEBIUS_API_KEY=<your_nebius_deepseek_inferecne_token>
    PERMIT_API_KEY=<your_permit_api_key>
    ```

3. Open the project on your terminal and run:
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
