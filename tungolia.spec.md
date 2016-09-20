search config:
### attributesToRetrieve  / implemented    =>    "attributesToRetrieve":["_all"]
### attributesToSearch    / implemented    =>    "attributesToSearch":["title"]
### term                  / implemented    =>    "term": "application"
### hitsPerPage           / implemented    =>    "hitsPerPage": 10
### page                  / implemented    =>    "page":1
### sortBy                / implemented    =>    "sortBy": "salary_type"
### sortOrder             / implemented    =>    "sortOrder": "asc" (desc, asc)
### typoTolerance         / implemented    =>    "typoTolerance": "max" (min,max)
### highlight             / implemented    =>    "highlight": true
### highlightPreTag       / implemented    =>    "highlightPreTag": "<b>"
### highlightPostTag      / implemented    =>    "highlightPostTag": "</b>"
### facets                / implemented    =>    "facets" : [{"field": "job_type", "type": "terms"},{"field": "incentive", "type": "stats"}]
### filters               / implemented    =>    "filters" : [{"field": "salary_min", "type": "range", "from": 1000, "to": 2000},
                                                              {"field": "salary_type", "type": "term", "value" : "Per month"}]
