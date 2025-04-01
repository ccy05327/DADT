# CM3010 - Past Exam Paper (March 2023)

## BSc EXAMINATION

**COMPUTER SCIENCE**
**Databases and Advanced Data Techniques**

**Release Date:** Monday 6 March 2023, 12:00 GMT  
**Submission Date:** Tuesday 7 March 2023, 12:00 GMT  
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

#### OpenDocument Data Structure

```xml
<office:text>
  <text:sequence-decls>
    <text:sequence-decl text:name="Illustration"/>
    <text:sequence-decl text:name="Table"/>
    <text:sequence-decl text:name="Text"/>
    <text:sequence-decl text:name="Drawing"/>
  </text:sequence-decls>
  <text:p>Consider the following three data structures:</text:p>
  <text:list>
    <text:list-item><text:p>Trees</text:p></text:list-item>
    <text:list-item><text:p>Graphs</text:p></text:list-item>
    <text:list-item><text:p>Relations</text:p></text:list-item>
  </text:list>
</office:text>
```

**Questions:**

- (a) What language is this encoded in? **[1 mark]**
- (b) What data structure does it use? **[1 mark]**
- (c) List the two namespaces used in this document. **[2 marks]**
- (d) What does the XPath expression `//text:list-item/text:p` return? How does it differ from `//text:list//text:p`? **[2 marks]**
- (e) Explain how the OpenDocument RelaxNG schema validates this document. **[4 marks]**
- (f) Assess the suitability of this data structure for encoding word processing documents. **[3 marks]**

---

### Question 3

#### MusicBrainz RDF Data Model

```turtle
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix schema: <http://schema.org/> .
<http://musicbrainz.org/artist/0d79fe8e-ba27-4859-bb8c-2f255f346853>
  schema:name "BTS" ;
  schema:sameAs <http://bts-official.jp/> .
```

**Questions:**

- (a) What type did we put into the accept header? **[1 mark]**
- (b) What is the full URL of the predicate `schema:member`? **[1 mark]**
- (c) How many band members of BTS are listed in this snippet? **[1 mark]**
- (d) Explain how the `schema:member` predicate is used. **[3 marks]**
- (e) Construct an **ER diagram** for this data model. **[4 marks]**
- (f) Write **CREATE TABLE** statements for two tables representing this model. **[5 marks]**

---

### Question 4

#### 16th-Century European Music Database

A database records **16th-century European music** and models relationships between **books, pages, and musical pieces**.

**Questions:**

- (a) How could we improve the model to store the order and coordinates for lines of music on a page? **[3 marks]**
- (b) Modify the ER diagram to account for multiple instrument or voice parts. **[8 marks]**
- (c) List tables and **primary/foreign keys** for a relational model. **[7 marks]**
- (d) Write a query to **list pieces** with their total number of lines. **[5 marks]**
- (e) Compare this relational model with an **XML-based database**. **[7 marks]**

---

## End of Paper
