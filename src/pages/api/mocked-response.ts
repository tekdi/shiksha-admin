export const genericEditorSaveFormResponse = {
    "id": "api.form.read",
    "params": {
        "status": "successful"
    },
    "responseCode": "OK",
    "result": {
        "form": {
            "type": "content",
            "subtype": "resource",
            "action": "save",
            "component": "*",
            "framework": "*",
            "data": {
                "templateName": "defaultTemplate",
                "action": "save",
                "fields": [
                    {
                        "code": "appicon",
                        "dataType": "url",
                        "description": "App Icon",
                        "editable": true,
                        "index": 1,
                        "inputType": "file",
                        "label": "App Icon",
                        "name": "App Icon",
                        "placeholder": "App Icon",
                        "renderingHints": {},
                        "required": false,
                        "visible": true
                    },
                    {
                        "code": "name",
                        "dataType": "text",
                        "description": "Title of the content",
                        "editable": true,
                        "index": 2,
                        "inputType": "text",
                        "label": "Title",
                        "name": "Title",
                        "placeholder": "Enter Title",
                        "renderingHints": {},
                        "required": false,
                        "visible": true
                    },
                    {
                        "code": "description",
                        "dataType": "text",
                        "description": "Brief description",
                        "editable": true,
                        "index": 3,
                        "inputType": "textarea",
                        "label": "Description",
                        "name": "Description",
                        "placeholder": "Brief description about the Book",
                        "renderingHints": {},
                        "required": false,
                        "visible": true
                    },
                    {
                        "code": "keywords",
                        "dataType": "list",
                        "description": "Keywords for the content",
                        "editable": true,
                        "index": 4,
                        "inputType": "keywordsuggestion",
                        "label": "keywords",
                        "name": "Keywords",
                        "placeholder": "Enter Keywords",
                        "required": false,
                        "visible": true
                    },
                    {
                        "code": "medium",
                        "dataType": "List",
                        "description": "Language",
                        "editable": true,
                        "index": 8,
                        "inputType": "select",
                        "label": "Language",
                        "name": "Langauge",
                        "placeholder": "Select Language",
                        "renderingHints": {},
                        "required": false,
                        "visible": true
                    },
                    {
                        "code": "audience",
                        "dataType": "list",
                        "description": "Audience",
                        "editable": true,
                        "index": 8,
                        "inputType": "multiselect",
                        "label": "Audience",
                        "name": "Audience",
                        "range": [
                            {
                                "key": "Student",
                                "name": "Student"
                            },
                            {
                                "key": "Teacher",
                                "name": "Teacher"
                            },
                            {
                                "key": "Administrator",
                                "name": "Administrator"
                            },
                            {
                                "key": "Teacher",
                                "name": "Teacher"
                            },
                            {
                                "key": "Other",
                                "name": "Other"
                            }
                        ],
                        "placeholder": "Select Audience",
                        "renderingHints": {},
                        "required": false,
                        "visible": true
                    },
                    {
                        "code": "attributions",
                        "dataType": "list",
                        "description": "Attributions",
                        "editable": true,
                        "index": 8,
                        "inputType": "text",
                        "label": "Attributions",
                        "name": "attribution",
                        "placeholder": "",
                        "renderingHints": {},
                        "required": false,
                        "visible": true
                    }
                ]
            },
            "created_on": "2019-09-08T03:04:38.104Z",
            "last_modified_on": "2020-09-08T12:50:30.070Z",
            "rootOrgId": "*"
        }
    },
    "ver": "1.0"
}

export const genericEditorReviewFormResponse = {
    "id": "api.form.read",
    "params": {
        "resmsgid": "3f255e2a-c31a-4396-9d95-1e8b42b3ed61",
        "msgid": "9754ec68-3862-4489-9f3a-3eca797257e3",
        "status": "successful"
    },
    "responseCode": "OK",
    "result": {
        "form": {
            "type": "content",
            "subtype": "resource",
            "action": "review",
            "component": "*",
            "framework": "*",
            "data": {
                "templateName": "defaultTemplate",
                "action": "review",
                "fields": [
                    {
                        "code": "appicon",
                        "dataType": "url",
                        "description": "App Icon",
                        "editable": true,
                        "index": 1,
                        "inputType": "file",
                        "label": "App Icon",
                        "name": "App Icon",
                        "placeholder": "App Icon",
                        "renderingHints": {},
                        "required": false,
                        "visible": true
                    },
                    {
                        "code": "name",
                        "dataType": "text",
                        "description": "Title of the content",
                        "editable": true,
                        "index": 2,
                        "inputType": "text",
                        "label": "Title",
                        "name": "Title",
                        "placeholder": "Enter Title For Book",
                        "renderingHints": {},
                        "required": false,
                        "visible": true
                    },
                    {
                        "code": "description",
                        "dataType": "text",
                        "description": "Brief description",
                        "editable": true,
                        "index": 3,
                        "inputType": "textarea",
                        "label": "Description",
                        "name": "Description",
                        "placeholder": "Brief description about the Book",
                        "renderingHints": {},
                        "required": false,
                        "visible": true
                    },
                    {
                        "code": "keywords",
                        "dataType": "list",
                        "description": "Keywords for the content",
                        "editable": true,
                        "index": 4,
                        "inputType": "keywordsuggestion",
                        "label": "keywords",
                        "name": "Keywords",
                        "placeholder": "Enter Keywords",
                        "required": false,
                        "visible": true
                    },
                    {
                        "code": "board",
                        "visible": true,
                        "depends": [
                            "medium",
                            "gradeLevel",
                            "subject",
                            "topic"
                        ],
                        "editable": true,
                        "dataType": "text",
                        "renderingHints": {},
                        "description": "Board",
                        "index": 7,
                        "label": "Board/Syllabus",
                        "required": true,
                        "name": "Board/Syllabus",
                        "inputType": "select",
                        "placeholder": "Select Board/Syllabus"
                    },
                    {
                        "code": "medium",
                        "visible": true,
                        "depends": [
                            "gradeLevel",
                            "subject",
                            "topic"
                        ],
                        "editable": true,
                        "dataType": "list",
                        "renderingHints": {},
                        "description": "",
                        "index": 8,
                        "label": "Medium",
                        "required": true,
                        "name": "medium",
                        "inputType": "multiselect",
                        "placeholder": "Select Medium"
                    },
                    {
                        "code": "gradeLevel",
                        "visible": true,
                        "depends": [
                            "subject",
                            "topic"
                        ],
                        "editable": true,
                        "dataType": "list",
                        "renderingHints": {},
                        "description": "Class",
                        "index": 9,
                        "label": "Class",
                        "required": true,
                        "name": "Class",
                        "inputType": "multiselect",
                        "placeholder": "Select Class"
                    },
                    {
                        "code": "subject",
                        "visible": true,
                        "depends": [
                            "topic"
                        ],
                        "editable": true,
                        "dataType": "list",
                        "renderingHints": {},
                        "description": "",
                        "index": 10,
                        "label": "Subject",
                        "required": true,
                        "name": "Subject",
                        "inputType": "multiselect",
                        "placeholder": "Select Subject"
                    },
                    {
                        "code": "medium",
                        "dataType": "list",
                        "description": "Language",
                        "editable": true,
                        "index": 8,
                        "inputType": "select",
                        "label": "Language",
                        "name": "Langauge",
                        "placeholder": "Select Language",
                        "renderingHints": {},
                        "required": false,
                        "visible": true
                    },
                    {
                        "code": "audience",
                        "dataType": "list",
                        "description": "Audience",
                        "editable": true,
                        "index": 8,
                        "inputType": "multiselect",
                        "label": "Audience",
                        "name": "Audience",
                        "range": [
                            {
                                "key": "Student",
                                "name": "Student"
                            },
                            {
                                "key": "Teacher",
                                "name": "Teacher"
                            },
                            {
                                "key": "Administrator",
                                "name": "Administrator"
                            },
                            {
                                "key": "Other",
                                "name": "Other"
                            }
                        ],
                        "placeholder": "Select Audience",
                        "renderingHints": {},
                        "required": false,
                        "visible": true
                    },
                    {
                        "code": "attributions",
                        "dataType": "list",
                        "description": "Attributions",
                        "editable": true,
                        "index": 8,
                        "inputType": "text",
                        "label": "Attributions",
                        "name": "attribution",
                        "placeholder": "",
                        "renderingHints": {},
                        "required": false,
                        "visible": true
                    }
                ]
            },
            "created_on": "2024-07-31T06:21:34.669Z",
            "last_modified_on": "2024-07-31T07:20:14.642Z",
            "rootOrgId": "*"
        }
    },
    "ts": "2024-10-10T12:25:59.637Z",
    "ver": "1.0"
}

export const genericEditorRequestForChangesFormResponse = {
    "id": "api.form.read",
    "params": {
        "resmsgid": "dd529494-4996-47c8-849d-f5862426fb39",
        "msgid": "06aa0ffa-306f-42eb-b7d6-b15596b858fe",
        "status": "successful"
    },
    "responseCode": "OK",
    "result": {
        "form": {
            "type": "content",
            "subtype": "resource",
            "action": "requestforchanges",
            "component": "*",
            "framework": "*",
            "data": {
                "templateName": "defaultTemplate",
                "action": "requestforchanges",
                "fields": [{ "contents": [] }]
            },
            "created_on": "2019-09-08T15:25:00.291Z",
            "last_modified_on": "2020-08-24T06:06:08.120Z",
            "rootOrgId": "*"
        }
    },
    "ts": "2024-10-25T07:24:32.384Z",
    "ver": "1.0"
}

export const telemetryResponse = {
    "id": "api.telemetry.post",
    "params": {
        "status": "successful"
    },
    "responseCode": "OK",
    "result": {
        "message": "This is mocked response"
    },
    "ver": "1.0"
}

export const creatLockResponse = {
    "id": "api.lock.create",
    "params": {
        "status": "successful",
    },
    "responseCode": "OK",
    "result": {
        "lockKey": "69d82e1c-6d91-4b2e-a873-39ebeab007b9",
        "expiresAt": "2026-10-09T12:53:41.138Z",
        "expiresIn": 63072000
    }
}