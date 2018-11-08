# Go4c Project Crawler

Simple web crawler to sift projects from the go4c website.

## Before you start

With [Node.js](https://nodejs.org/) installed, make sure that you have added a `credentials.js` file similar to:
```javascript
module.exports = {
    username: 'myusername',
    password: 'mypassword'
}
```
and that you edited the `PROJECTS_LINK` in `crawl.js` to reflect your team number, then run
```
npm install
```
followed by
```
node crawl.js
```
If the crawl process has not started (no progress indication on the terminal) after a few seconds, try restarting it.

## JSON Format

All projects are saved into a JSON file. Each project is an object that contains:
```javascript
{
status: String,                      //blocked | chosen | active | available
name: String,                        //WP001 to WP056
success: String,                     //0.00% to 100%
description: String,                 //What the project does
id: Int,                             //1 to 56
short_name: String,                  //Project title
cost: Int,
stats: {                             //Benefits matrix, scored from 0 (no effect) to 3 (maximum effect)
    "bank": {
        "process": Int,
        "knowledge": Int,
        "risk": Int,
        "information": Int
    },
    "marketing": {
        "process": Int,
        "knowledge": Int,
        "risk": Int,
        "information": Int
    },
    "production": {
        "process": Int,
        "knowledge": Int,
        "risk": Int,
        "information": Int
    },
    "it": {
        "process": Int,
        "knowledge": Int,
        "risk": Int,
        "information": Int
    }
}
preconditions: [String]               //Array with names of preconditions ["WP002","WP007"]
constraints: [String]                 //Array with names of constraints ["WP002","WP007"]
resources: [                          //Array of Objects with required and allocated resources
    {
    "name": "Emp. Man. required",
    "buildtime": {
        "amount_required": String,    //Float number represented as String in the system
        "amount_allocated": String
    },
    "runtime": {
        "amount_required": String
    }},
    {
    "name": "Emp. Org. required",
    "buildtime": {
        "amount_required": String,
        "amount_allocated": String
    },
    "runtime": {
        "amount_required": String
    }},
    {
    "name": "Emp. IT Dev.",
    "buildtime": {
        "amount_required": String,
        "amount_allocated": String
    },
    "runtime": {
        "amount_required": String
    }},
    {
    "name": "Emp. Mark.",
    "buildtime": {
        "amount_required": String,
        "amount_allocated": String
    },
    "runtime": {
        "amount_required": String
    }},
    {
    "name": "Emp. S&M Loans",
    "buildtime": {
        "amount_required": String,
        "amount_allocated": String
    },
    "runtime": {
        "amount_required": String
    }},
    {
    "name": "Emp. Orig. Loans",
    "buildtime": {
        "amount_required": String,
        "amount_allocated": String
    },
    "runtime": {
        "amount_required": String
    }},
    {
    "name": "Emp. Serv. Loans",
    "buildtime": {
        "amount_required": String,
        "amount_allocated": String
    },
    "runtime": {
        "amount_required": String
    }},
    {
    "name": "Emp. S&M Sav.",
    "buildtime": {
        "amount_required": String,
        "amount_allocated": String
    },
    "runtime": {
        "amount_required": String
    }},
    {
    "name": "Emp. Orig. Sav.",
    "buildtime": {
        "amount_required": String,
        "amount_allocated": String
    },
    "runtime": {
        "amount_required": String
    }},
    {
    "name": "Emp. Serv. Sav.",
    "buildtime": {
        "amount_required": String,
        "amount_allocated": String
    },
    "runtime": {
        "amount_required": String
    }},
    {
    "name": "Emp. Ext. Man.",
    "buildtime": {
        "amount_required": String,
        "amount_allocated": String
    },
    "runtime": {
        "amount_required": String
    }},
    {
    "name": "Emp. Ext. Org.",
    "buildtime": {
        "amount_required": String,
        "amount_allocated": String
    },
    "runtime": {
        "amount_required": String
    }},
    {
    "name": "Emp. Ext. IT",
    "buildtime": {
        "amount_required": String,
        "amount_allocated": String
    },
    "runtime": {
        "amount_required": String
    }},
    {
    "name": "Server required",
    "buildtime": {
        "amount_required": String,
        "amount_allocated": String
    },
    "runtime": {
        "amount_required": String
    }},
    {
    "name": "Storage required",
    "buildtime": {
        "amount_required": String,
        "amount_allocated": String
    },
    "runtime": {
        "amount_required": String
    }},
    {
    "name": "Comm. required",
    "buildtime": {
        "amount_required": String,
        "amount_allocated": String
    },
    "runtime": {
        "amount_required": String
    }}
]
}
```
