# 42 Seat Selector API

This repository uses node.js, express and mongodb to create a microservice that selects seats for attendess of 42 events/exams based on the selection strategy specified.

Check out the [Seat Selector Demo]().

## Usage

Simply fork the repository.

```
git clone https://github.com/faraz7704/42-seat-selector
```
Command to run the microservice locally.
```
npm run start
```

### Integration & Optimization
Replace coding lines commented with `// TODO:`

[controller.js](https://github.com/Faraz7704/42-seat-selector/blob/main/api/controller.js)
```js
138   // TODO: path should be changed to '/exams/${id}/exams_users'
139   const url = `/events/${id}/events_users`;
...
170   // TODO: path should be changed to '/exams/${id}/exams_users'
171   const url = `/events/${id}/events_users`;
```

[clusters.js](https://github.com/Faraz7704/42-seat-selector/blob/main/service/clusters.js)
```js
20    // TODO: change to intra api call for actual clusters data
21    let clusters = require('../assets/clusters.json');
```

## API Calls & Customization

### Fetch all seats for all exams
```js
GET     http://localhost:3000/exams_seats
```

### Generating seats by exam id

```js
// one-time generator that returns json data of all the attendees seated for the exam (data doesn't persist).
GET     http://localhost:3000/exams_seats/{id}/generate

// generator that returns status and saves the selection data to database
POST    http://localhost:3000/exams_seats/{id}/generate

// GET & POST request body params
body = {

  "strategy": "SMART_RANDOM"    // defaults to SMART_RANDOM
  
  // sent email to everyone registered for the exam
  "sentEmail": true,            // defaults to false
  
  // minimum spacing to consider when selecting seats for attendees
  "minSpacing": 2,              // defaults to dynamic spacing based on attendees capacity
  
  // lab ids to consider for selection
  // labs param have higher priority if both are specified
  "labs": ["lab1", "lab2"],     // mandetory if seats param is not specified
  
  // seat objects to consider for selection
  "seats": [                    // mandetory if labs param is not specified
    {
      "id": "lab1r2s8",
    },
    {
      "id": "lab1r3s5"
    }
  ]
}
```
