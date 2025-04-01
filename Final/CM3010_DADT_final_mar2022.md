# CM3010 - Exam Paper (March 2022)

## BSc EXAMINATION

**COMPUTER SCIENCE**  
**Databases and Advanced Data Techniques**

**Release Date:** Tuesday 8 March 2022, 12:00 GMT  
**Submission Date:** Wednesday 9 March 2022, 12:00 GMT  
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

#### English Monarchy XML Data

```xml
<royal name="Henry" xml:id="HenryVII">
  <title rank="king" territory="England" regnal="VII"
    from="1485-08-22" to="1509-04-21" />
  <relationship type="marriage" spouse="#ElizabethOfYork">
    <children>
      <royal name="Arthur" xml:id="ArthurTudor"/>
      <royal name="Henry" xml:id="HenryVIII">
        <title rank="king" territory="England" regnal="VIII"
          from="1509-04-22" to="1547-01-28" />
      </royal>
    </children>
  </relationship>
</royal>
```

**Questions:**

- (a) Give two examples of element names and two examples of attribute names. **[2 marks]**
- (b) What will be the result of the XPath query: `//title[@rank="king" and @regnal="VIII"]/../royal[@name="Henry"]`? **[3 marks]**
- (c) What will be returned by `//title[@rank="king" or @rank="queen"]/../relationship/children/royal/relationship/children/royal/`? **[3 marks]**
- (d) Add XML to record Mary I’s title as queen consort of Spain. **[4 marks]**
- (e) Discuss the strengths and weaknesses of this XML model. **[7 marks]**
- (f) Should this data be modeled as a relational database or Linked Data (RDF)? Justify your answer. **[10 marks]**

---

### Question 3

#### Wikidata SPARQL Queries

**Questions:**

- (a) What does the following query return? **[2 marks]**

  ```sparql
  SELECT DISTINCT ?person WHERE {
    ?person wdt:P31 wd:Q5 ;
            wdt:P19 wd:Q60 .
  }
  ```

- (b) What assumptions does this query make? **[2 marks]**
- (c) How does this query differ from the modified version below? **[4 marks]**

  ```sparql
  SELECT DISTINCT ?person WHERE {
    ?person wdt:P31 wd:Q5 ;
            wdt:P19/wdt:P131* wd:Q60 .
  }
  ```

- (d) Why are these results not human-readable? **[1 mark]**
- (e) Modify query (c) to return more readable results. **[5 marks]**
- (f) Compare IMDB’s approach to querying people by birth location with Wikidata’s approach. **[6 marks]**
- (g) How could IMDB’s specialized data be combined with Wikidata’s strengths? **[4 marks]**
- (h) Represent the information queried in (b) using the relational model. **[4 marks]**
- (i) How would you implement query (c) in SQL? **[6 marks]**

---

### Question 4

#### Hospital Database Model

A health organization is designing a database to track doctors, hospitals, and patients.

**Questions:**

- (a) Which of the following questions can be answered by the given model? **[3 marks]**
  - i. Which building did patient X stay in?
  - ii. Which hospital was responsible for patient X’s stay?
  - iii. In which wards are Orthopedics patients housed?
  - iv. Which hospitals does Doctor Y work in?
  - v. What departments exist in hospital Z?
  - vi. Which doctor treated patient X?
- (b) What part of this model cannot be implemented using the relational model? **[3 marks]**
- (c) Modify the model to resolve the issue in (b). Include cardinality in your diagram. **[10 marks]**
- (d) List tables and keys for an SQL implementation. **[5 marks]**
- (e) Provide an SQL query for each question in (a). **[6 marks]**
- (f) Would an XML-based model be more suitable? Justify your answer. **[3 marks]**

---

## End of Paper
