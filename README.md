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
Replace coding lines commented with `// TODO:` for production.

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

### Fetch seats for all exams
```js
GET     http://localhost:3000/exams_seats
```

### Generating seat selection by exam ID

One-time generator that returns json data of all the attendees seated for the exam (data doesn't persist).
```js
GET     http://localhost:3000/exams_seats/:id/generate
```
Generator that returns status and saves the selection data to database
```js
POST    http://localhost:3000/exams_seats/:id/generate
```
`GET` & `POST` request body params
```json5
{
  // defaults to SMART_RANDOM
  "strategy": "SMART_RANDOM",
  
  // sent email to everyone registered for the exam, defaults to false
  "sentEmail": true,
  
  // minimum spacing to consider when selecting seats for attendees
  // defaults to dynamic spacing based on attendees capacity
  "minSpacing": 2,
  
  // lab ids to consider for selection
  // labs param have higher priority if both are specified
  // mandetory if seats param is not specified
  "labs": ["lab1", "lab2"],
  
  // seat objects to consider for selection; mandetory if labs param is not specified
  "seats": [
    {
      // mandatory field
      "id": "lab1r2s8",
      
      // don't consider seat for selection changed with strategy; defaults to false
      "isBlocked": "false",
      
      // don't consider seat for selection; defaults to true
      "isEnabled": "true",
    },
    ...
  ]
}
```

### Fetch/Update/Delete seats by exam ID

Get seats by exam ID from database
```js
GET     http://localhost:3000/exams_seats/:id
```
Update seats by exam ID from database
```js
PUT     http://localhost:3000/exams_seats/:id
```
Reset seats by exam ID from database
```js
POST    http://localhost:3000/exams_seats/:id
```
`PUT` & `POST` request body params
```json5
{
  // lab seats to add to database
  // labs param have higher priority if both are specified
  // mandetory if seats param is not specified
  "labs": ["lab1", "lab2"],
  
  // seat objects to add to database; mandetory if labs param is not specified
  "seats": [
    {
      // mandatory field
      "id": "lab1r2s8",
      
      // don't consider seat for selection changed with strategy; defaults to false
      "isBlocked": "false",
      
      // don't consider seat for selection; defaults to true
      "isEnabled": "true",
    },
    ...
  ]
}
```
Remove seats from database
```js
DELETE    http://localhost:3000/exams_seats/:id
```
`DELETE` request body params
```json5
{
  // lab seats to remove from database
  // labs param have higher priority if both are specified
  // if neither are specified all seats are removed from the database
  "labs": ["lab1", "lab2"],
  
  // seat objects to remove from database
  "seats": [
    {
      // mandatory field
      "id": "lab1r2s8",
    },
    ...
  ]
}
```

### Fetch/Update/Delete seats by user(attendees) ID

Getting attendees seat by user_id from database
```js
GET     http://localhost:3000/exams_seats/:id/:user_id
```
Update attendee seat by user_id to database
```js
PUT     http://localhost:3000/exams_seats/:id/:user_id
```
`PUT` request body params
```json5
{
  // move attendee to a new seat
  // defaults to false
  "reallocate": true,
}
```
Remove attendee from seat by user_id from database
```js
DELETE   http://localhost:3000/exams_seats/:id/:user_id
```

### Send emails by exam ID

Send emails to attendees by exam ID and email status
```js
POST    http://localhost:3000/exams_seats/:id/send_emails
```
`POST` request body params
```json5
{
  // sends email to everyone again
  // defaults to false
  "sendEmailAgain": true,
}
```

### Features to Add





