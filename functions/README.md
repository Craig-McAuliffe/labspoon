# Environment Variables

Environment variables for functions are set through the functions config as described in https://firebase.google.com/docs/functions/config-env. See https://firebase.google.com/docs/functions/local-emulator for emulated functions config.

The current structure of the config is as follows (see the relevant section for explanation of the keys):

```
{
    "env": {
        "name": ...
    },
    "microsoftacademicknowledgeapi": {
        "subscriptionkey": ...
    },
    "algolia": {
        "admin_key": ...,
        "app_id": ...,
        "search_key": ...
    }
}
```

## env
Describes the labspoon environment that the functions are running in. Should be set to "dev" for local development.

## algolia
Contains keys for the Algolia admin API, for writing new data to the search indexes. These keys are retrieved from the Algolia dashboard.

## microsoftacademicknowledgeapi
Contains the access token for the Microsoft Academic Knowledge API, which can be requested and retrieved through the Microsoft Research API portal https://msr-apis.portal.azure-api.net/products.
