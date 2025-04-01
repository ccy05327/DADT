# CM3010 - Exam Paper (September 2021)

## BSc EXAMINATION

**COMPUTER SCIENCE**  
**Databases and Advanced Data Techniques**

**Release Date:** Tuesday 7 September 2021, 12:00 BST  
**Submission Date:** Wednesday 8 September 2021, 12:00 BST  
**Time Allowed:** 24 hours to submit  

### Instructions to Candidates

- Section A consists of **TEN Multiple Choice Questions (MCQs)** to be completed separately on the VLE.
- **All** MCQs in Section A must be attempted.
- Section A carries a **maximum of 40 marks**.
- Section B is an **online assessment** to be completed within the same **24-hour window** as Section A.
- **Answer TWO out of THREE** questions in Section B.
- Section B carries a **maximum of 60 marks**.
- **Calculators are NOT permitted**.
- Credit is given **only if all workings are shown**.
- Answers must be submitted as a **single document (Microsoft Word or PDF)**.
- Each file must include a **coversheet with the candidate number**.
- Do **not** include your name in any submitted answers.

---

## Section A

Candidates should complete the **TEN MCQs** in Section A on the VLE.

---

## Section B

Candidates should answer **TWO** of the following **THREE** questions.

### Question 2

#### Bird Sightings Database

**Table Structure:**

| Species                  | Date       | Number Sighted | Conservation Status | Nature Reserve     | Location  |
|--------------------------|------------|----------------|---------------------|--------------------|-----------|
| Bar-tailed godwit       | 2021-04-21  | 31             | Least concern       | Rainham Marshes   | 51.5N 0.2E|
| Wood pigeon            | 2021-04-21  | 31             | Least concern       | Rainham Marshes   | 51.5N 0.2E|
| Greater spotted woodpecker | 2021-06-13  | 1              | Least concern       | Epping Forest     | 51.6N 0.0E|
| European turtle dove   | 2021-06-13  | 2              | Vulnerable          | Epping Forest     | 51.6N 0.0E|

**Questions:**

- (a) Write a **MySQL query** to retrieve all bird types seen since **January 1, 2021**. **[4 marks]**
- (b) Is this table in **1NF (First Normal Form)**? Explain. **[3 marks]**
- (c) Normalize the data and list the resulting tables with **primary and foreign keys**. **[7 marks]**
- (d) What normal form have you reached? Explain. **[4 marks]**
- (e) Write a **query** to retrieve bird types and conservation status for birds seen since January 1, 2021. **[5 marks]**
- (f) Should transactions be used for updates? Provide **example SQL operations**. **[7 marks]**

---

### Question 3

#### MEI Music Encoding Data Structure

```xml
<measure>
  <staff n="2">
    <layer n="1">
      <chord xml:id="d13e1" dur="8">
        <note xml:id="d1e101" pname="c" oct="5"/>
        <note xml:id="d1e118" pname="a" oct="4"/>
      </chord>
    </layer>
  </staff>
</measure>
```

**Questions:**

- (a) List all **element types** in the XML. **[2 marks]**
- (b) Correct the XPath expression `/staff[n="2"]/layer/chord[note/@pname="c"]`. **[3 marks]**
- (c) Convert the first **chord** element into **JSON format**. **[5 marks]**
- (d) Write a **MongoDB find command** to return chords with upward stems containing `f`. **[5 marks]**
- (e) Convert the **MEI model** into **RDF format**. **[5 marks]**
- (f) Compare XML, **MongoDB/JSON**, and **RDF** for representing music notation. **[7 marks]**

---

### Question 4

#### Zoo Database Model

A **database system** is being designed to coordinate **zoos and animal collections** worldwide.

**ER Model:**

- **Zoo** contains multiple **Enclosures**.
- **Enclosure** houses multiple **Animals**.
- **Animal** belongs to a **Species**.
- **Species** has attributes like **Latin Name, Conservation Status**.

**Questions:**

- (a) List tables and fields for an **SQL implementation** of this design. **[4 marks]**
- (b) Write **CREATE TABLE** statements for **two tables**, including foreign keys. **[6 marks]**
- (c) Write an SQL query to count the number of species in the **Singapore Zoo**. **[5 marks]**
- (d) Write an SQL query to find the **oldest animal** of species `Buceros bicornis` in each zoo. **[5 marks]**
- (e) Assess the suitability of **XML or RDF** for this model. Provide **example data**. **[10 marks]**

---

## End of Paper
