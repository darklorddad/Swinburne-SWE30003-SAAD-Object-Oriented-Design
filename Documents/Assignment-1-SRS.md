# Swinburne University of Technology Sarawak Campus
## School of Information and Communication Technology
### SWE30003 Software Architectures and Design

**Assignment 1 – SRS**

**Due:** 11.59 PM on Friday of Week 5 of the Semester
**Submission:** Electronic submission via Canvas

Swin Consulting has been approached by the management of our state's National Parks Marketing Company to develop a mobile app and a website to expand its physical on-site ticketing operation for all national parks in the state. More specifically, their management is interested in giving customers the opportunity to sign up, sign in, order, cancel, reschedule, and refund tickets and purchase merchandise conveniently online. The management is also interested in getting some basic statistics about the demographics and visits over various periods.

The management of Swin Consulting requires you (i.e., your assignment team) to develop a requirements specification using the **Tasks and Support** approach to better assess the required development efforts (as well as associated costs). In doing so, you are requested to particularly focus on *domain-level requirements* (i.e. the tasks that users want/need to perform with the support of the envisaged Online system), as well as specific *quality attributes* (i.e. non-functional requirements) the Online store must meet. In addition, the requirements specification should also contain information about the *context* of the Online system, appropriate domain requirements (e.g., a *simple* domain model – no database scheme!), as well as any requirements at the design and product levels (cf. the Goal-Design Scale discussed in the lectures) that you consider as being important. Furthermore, taking the identified user tasks as well as the application domain into consideration, identify and appropriately specify *four quality attributes* (i.e. non-functional requirements) that you consider to be *particularly important* for the Online system.

Here are some "ground rules" for the case study system:

*   Think about what *type of project* the client is dealing with.
*   Make sure that you identify the domain entities and their relationships and use the correct terminology in the requirements.
*   Illustrate the project incentives and list the most important requirements at the *goal level*. Identifying the "pain points" of the existing processes helps to do so.
*   You can assume that the client has very detailed user-interface guidelines for any of the IT systems it develops, and they do not need to be further specified. A reference to the corresponding document should, however, be added to the requirements specification – please make up a sensible document reference.
*   Carefully identify all actors of the proposed system – not all of them are obvious!
*   Carefully identify and document the typical "workflow" of events in the online store, starting from customers browsing and ordering goods to customers paying and all the way to customers receiving the delivered goods.
*   Your submission must illustrate any *validation steps* you have undertaken in the creation of the requirements specification. Please include evidence of such validation steps in a suitable Appendix.
*   To avoid a too solution-oriented view of task descriptions, consider at least two to three *different* solutions to the problem and make sure that the task descriptions are applicable to each of your solutions.

***

*   You are to elaborate only on the *software part* of the proposed system. Assume that any warehouse, hardware or platform required to deploy the online system and fulfil online transactions can be acquired/purchased in due course.
*   **Any (and all) assumptions made are to be documented!**

**Sample requirements specifications** (from a different case study) will be made available on Canvas in due course as a guide to what form to use, etc. (*Note that these sample specification(s) do not necessarily represent the "best submission" in terms of proper structure, notations or practices. You should aim to come up with a better submission based on what you learned in this unit.*)

**Marking guidelines/criteria** on what aspects of your submission will contribute and how much towards the final mark will also be posted on Canvas. Please use the dedicated discussion forum on Canvas for any further clarifications that benefit all, and **no individual emails in this regard will be replied to.**

### Submission details
Each assignment group is to submit their proposal in electronic form, along with the appropriately signed and completed "**Assignment and Project Cover Sheet**" declaration form (see below), *which all group members must sign.*

Each group is further required to submit a **contribution document**, signed by *all* group members, that
1.  lists the amount of time spent by each member on each significant part of the assignment and
2.  provides evidence that the assignment is done through *true* group collaboration, e.g., discussions and mutual reviews of all parts of the assignment.

Note: For the assignments in this Unit of Study, students are to work in groups of three or four as allocated/agreed by the Tutor. Permission is required to change groups prior to the submission deadline. Extensions to the submission deadline can only be granted for genuine reasons, and the Unit of Study convener must be contacted with supporting evidence *at least 48 hours* prior to the submission deadline.

The **electronic submission** is through Canvas, with the deadline as published at the front of this assignment specification. **(No hardcopy submission is required.)**

Unless the Unit of Study convener has approved an extension, any late submissions will be penalised by 10% of the assessment's worth for each calendar day (or part of) the task is late, up to a maximum of 5 days. After 5 days, a zero result will be recorded, and *no feedback* may be given on the respective submission.

***

# Swinburne University of Technology Sarawak Campus
## School of Information and Communication Technology
### ASSIGNMENT AND PROJECT COVER SHEET

**Subject Code:** SWE30003
**Unit Title:** Software Architectures and Design

**Assignment number and title:** 1, Requirements
**Project Group No:** _______________

**To be completed as this is a group assignment**
We declare that this is a group assignment and that no part of this submission has been copied from any other student's work or from any other source except where due acknowledgement is made explicitly in the text, nor has any part been written for us by another person.

| ID Number | Name | Signature |
| :--- | :--- | :--- |
| _______________ | _____________________________________________ | ________________________ |
| _______________ | _____________________________________________ | ________________________ |
| _______________ | _____________________________________________ | ________________________ |
| _______________ | _____________________________________________ | ________________________ |

**Marker's comments:**

Total Mark: _______________

**Extension certification:**

This assignment has been given an extension and is now due on ________________________

Signature of Convener: ________________________

***

# SWE30003 Software Architecture and Design
## Assignment 1
## Marking Criteria

| Area | Elements | Possible marks | Actual marks |
| :--- | :--- | :---: | :---: |
| Project Goals, Assumptions | Project Type, Goals and Objectives, Project Incentives, Context<br>What assumptions are made? Are they realistic and within the given constraints? Are they described in enough detail? | 5 | |
| Data/Domain Model | Simple ER-type domain model, basic description of entities – deduct up to 3 marks if attributes are given (solution) | 5 | |
| User Tasks in Tasks & Support style | Major user tasks must be supported by the system (5 marks each, maximum 40 marks)<br>Deduct marks if the Task & Support style is not adhered to | 40 | |
| Workflow | Identification and illustration of the basic "workflow(s)".<br>It must cover the main user tasks. | 5 | |
| Quality Attributes (non-functional requirements) | The focus should be on 4 (or more) **most relevant** categories (5 marks each, maximum 20 marks) | 20 | |
| Other Requirements | • Design and product-level requirements<br>• Has the problem been thought through properly? | 5 | |
| Validation | Evidence of validation of requirements? | 10 | |
| Verifiability | Are all listed requirements *verifiable*?<br>If not, what are the basic problems? | 5 | |
| Coherent Document | • Suitable overall document structure<br>• Clarity and non-contradiction in requirements<br>• Title page, table of contents, numbered sections/pages<br>• General presentation style, use of English, diagrams, etc.<br>• Pitched at an appropriate audience? | 5 | |
| Meeting the requirements of the assignment specification | • Cover sheet signed (penalty up to 5)<br>• Worksheet (contribution document) completed and signed (penalty up to 10)<br>• Contributions and collaborations | -xx | |
| **Total** | | **100** | |

**Comments:**

1.  Goals/objectives:
2.  Domain/data model:
3.  Workflow:
4.  Tasks:
5.  Qualities:
6.  Other requirements:
7.  Validation:
8.  Verifiability:
9.  Coherence:
10. Meeting requirements (penalties):