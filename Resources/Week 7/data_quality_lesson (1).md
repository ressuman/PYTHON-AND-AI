# Why Data Quality Breaks AI Products

## Opening: A RAG Pipeline Failing Because of Dirty Data

Imagine you've built a retrieval-augmented generation system for a company's HR policies. A user asks: *"How many vacation days do new employees get?"*

Here's what your pipeline retrieves from the vector store and feeds to the LLM:

```
[CHUNK 1] Vacation Policy\xe2\x80\x94New hires receive 15 days...
[CHUNK 2] ﻿Vacation Policy — Updated 2019 — New hires receive 10 days
[CHUNK 3] vacation_days,role,tenure
          15,engineer,0-2
          ,manager,
          20,engineer,2+
[CHUNK 4] [Page 47 of 89] ...continued from previous section, see also
          Appendix B for the full schedule of...
```

And here's the model's confident answer:

> **"New employees receive 10 vacation days per year, though some sources indicate 15. The policy may vary by role."**

That answer is wrong, hedging, and unusable. But notice: the *model* didn't fail. The *retrieval* didn't fail in the technical sense — it found relevant chunks. The data failed.

Look at what actually went wrong:

1. **Encoding artifacts** — `\xe2\x80\x94` is an em-dash that wasn't decoded as UTF-8. The text is now garbled in the embedding space.
2. **A BOM character** (`﻿`) at the start of chunk 2 means it was saved from Excel as UTF-8-with-BOM and never cleaned. It also happens to be the *outdated 2019 policy* that should have been deleted.
3. **A CSV chunk with missing values** — the manager row has empty cells, and the chunk got split mid-table so the column headers are detached from later rows.
4. **A page-break artifact** — "continued from previous section" leaked in from PDF extraction, polluting the chunk with non-content.

### The fix

Before re-indexing, run the data through a cleaning pass:

```python
import pandas as pd
import unicodedata

def clean_text(s: str) -> str:
    # Normalize unicode (handles the em-dash issue)
    s = unicodedata.normalize("NFKC", s)
    # Strip BOM if present
    s = s.lstrip("\ufeff")
    # Drop PDF artifacts
    s = s.replace("[continued from previous section]", "")
    return s.strip()

# For the CSV-in-text chunk, parse it as a real table
df = pd.read_csv("vacation_policy.csv")
df = df.dropna(subset=["vacation_days"])  # drop rows with no value
df["vacation_days"] = df["vacation_days"].astype(int)
```

After cleaning and re-indexing (and removing the superseded 2019 doc), the same query returns:

> **"New engineers receive 15 vacation days per year. After 2 years of tenure, this increases to 20 days."**

Same model. Same prompt. Same retrieval logic. The only thing that changed was the data hygiene before the pipeline ever ran.

**The lesson:** AI products don't usually fail because the model is dumb. They fail because somewhere upstream, somebody saved a CSV with the wrong encoding, or a PDF extractor leaked page numbers into the body, or a column got loaded as strings instead of integers. Today we learn to see those failures before they reach production.

---

## Pandas Fundamentals

### What is a DataFrame?

A DataFrame is a 2D labeled table. Think of it as a spreadsheet you can program against. Two things make it different from a list-of-lists or a dictionary:

- **It has a row index and column labels.** Rows aren't just numbered 0, 1, 2 — they have *names* (which might happen to be numbers). Columns aren't just positions — they have *names*.
- **Each column has a dtype.** Every value in the `age` column is an `int64`. Every value in `signup_date` is a `datetime64`. This matters enormously for data quality, because dtype mismatches are how dirty data announces itself.

```python
import pandas as pd

df = pd.DataFrame({
    "name":  ["Ama",  "Kofi", "Esi"],
    "age":   [29,     34,     41],
    "city":  ["Accra", "Kumasi", "Tamale"],
})
```

This produces:

```
   name  age    city
0   Ama   29   Accra
1  Kofi   34  Kumasi
2   Esi   41  Tamale
```

The leftmost column (`0, 1, 2`) is the index. The top row is the column labels. Everything else is data.

### Loading Data

You almost never type DataFrames by hand. You load them. Pandas has readers for most formats:

```python
pd.read_csv("file.csv")
pd.read_json("file.json")
pd.read_excel("file.xlsx")
pd.read_parquet("file.parquet")
```

Each has dozens of parameters for handling messy real-world inputs. We'll see why that matters in the next section.

### `.loc[]` vs `.iloc[]` — Drill This

This is the single most common source of confusion for new pandas users, and getting it wrong silently produces wrong answers. So we drill it.

**The rule:**
- **`.loc[]`** indexes by **label** (the actual name of the row or column).
- **`.iloc[]`** indexes by **integer position** (0, 1, 2, like a Python list).

These look identical when your index is `0, 1, 2, ...` and that's the trap. They diverge the moment your index isn't the default.

```python
df = pd.DataFrame({
    "score": [85, 90, 78, 92],
}, index=["a", "b", "c", "d"])
```

```
   score
a     85
b     90
c     78
d     92
```

Now:

```python
df.loc["a"]      # row labeled "a" → score 85
df.iloc[0]       # row at position 0 → score 85
                 # same answer, but for a different REASON
```

Now drop a row and watch them diverge:

```python
df = df.drop("a")
df.loc["b"]      # row labeled "b" → score 90  ✓
df.iloc[0]       # row at position 0 → score 90 (was b!)
df.iloc[1]       # row at position 1 → score 78
df.loc[1]        # ERROR — there is no row LABELED 1
```

A second trap: **slicing behaves differently.**

```python
df.iloc[0:2]   # positions 0, 1 — STOPS BEFORE 2 (Python convention)
df.loc["b":"c"]  # labels "b" THROUGH "c" — INCLUSIVE on both ends
```

Yes, really. `.loc` slicing is inclusive on both endpoints. `.iloc` is half-open like a normal Python slice. This catches everyone at least once.

**Selecting cells (rows and columns at once):**

```python
df.loc["b", "score"]      # row "b", column "score"
df.iloc[0, 0]             # first row, first column
df.loc[["b", "c"], "score"]  # multiple rows, one column
df.loc[:, "score"]        # all rows, one column
```

**The mental model that fixes this for good:** when you write `df[something]`, ask "am I naming this thing or counting to it?" If naming, `.loc`. If counting, `.iloc`. Plain `df["score"]` is column selection by name and is fine. Plain `df[0]` is almost always a mistake — it tries to find a *column named 0*, not the first column.

---

## File Ingestion: What Breaks and Why

### CSV — The Format That Lies About Being Simple

CSV looks trivial. It is not. Three things go wrong constantly:

**1. Encoding.** A file saved on a Windows machine in Excel often uses `cp1252` or `latin-1`, not UTF-8. If you open it with the default reader:

```python
df = pd.read_csv("customers.csv")
# UnicodeDecodeError: 'utf-8' codec can't decode byte 0xe9 in position 47
```

That `0xe9` is `é` in latin-1. The fix:

```python
df = pd.read_csv("customers.csv", encoding="latin-1")
# or
df = pd.read_csv("customers.csv", encoding="cp1252")
```

Worse: the file *might* load with UTF-8 and silently produce garbage like `Ã©` instead of `é`. You won't get an error — you'll get a downstream model that thinks "André" and "AndrÃ©" are different people.

**2. Delimiter.** Not all "CSV" files use commas. European exports often use semicolons because commas are decimal separators there. Tab-separated files (`.tsv`) use tabs. Some lunatics use pipes.

```python
# Defaults to comma — will load the whole row into one column
df = pd.read_csv("euro_sales.csv")
df.columns
# Index(['name;amount;date'], dtype='object')   ← red flag

# Fix:
df = pd.read_csv("euro_sales.csv", sep=";")
```

If you ever see a DataFrame with a single column whose name contains punctuation, you have a delimiter problem.

**3. Quoting and embedded delimiters.** A field like `"Smith, John"` contains a comma. If quoting is misconfigured, that one cell becomes two. Pandas usually handles this, but malformed CSVs (especially hand-edited ones) will break it. Watch for `pd.errors.ParserError`.

### JSON — Two Different Formats Both Called JSON

**Records-style** (a list of objects) — what most APIs return:

```json
[
  {"name": "Ama", "age": 29},
  {"name": "Kofi", "age": 34}
]
```

```python
df = pd.read_json("records.json")
```

**Lines-style / NDJSON** (one JSON object per line) — what most data pipelines emit:

```
{"name": "Ama", "age": 29}
{"name": "Kofi", "age": 34}
```

```python
df = pd.read_json("data.jsonl", lines=True)
```

If you forget `lines=True` on the second format, you get `ValueError: Trailing data`. If you pass `lines=True` to the first, you get a single-row DataFrame with weird columns. Look at the file before loading it.

**Nested JSON is the real trap.** Real APIs return things like:

```json
{"user": {"name": "Ama", "address": {"city": "Accra"}}, "orders": [...]}
```

`pd.read_json` will give you a column called `user` whose values are dicts. You can't filter, group, or embed that. Use `pd.json_normalize()` to flatten:

```python
import json
data = json.load(open("nested.json"))
df = pd.json_normalize(data, sep="_")
# Now you have columns: user_name, user_address_city, ...
```

### Excel — Where Data Goes to Get Weird

Excel introduces problems CSV doesn't have:

- **Multiple sheets.** `pd.read_excel("file.xlsx")` reads only the first sheet by default. If the data is in `Sheet2`, you'll silently load the wrong thing. Always pass `sheet_name="..."` explicitly, or `sheet_name=None` to get a dict of all sheets.
- **Merged cells, title rows, blank rows.** A spreadsheet built for humans often has a title in row 1, blanks in row 2, and headers in row 3. Pandas will treat row 1 as the header. Use `header=2` (0-indexed) and `skiprows=` to fix it.
- **Type coercion.** Excel will silently convert a column of postal codes starting with `0` into integers, dropping the leading zero. By the time you read it in pandas, `"01234"` has become `1234`. The fix is to specify `dtype={"postal_code": str}` on read, but only if you knew it was a problem in the first place.
- **Date formats.** Excel dates are sometimes serial numbers (e.g., `45000`), sometimes strings, sometimes real datetimes. Always check `df.dtypes` after reading.

The general principle: **never trust a file. Always run `df.head()`, `df.dtypes`, and `df.shape` immediately after loading**, and confirm they match what you expected.

---

## Guided Exercise: Diagnose a Dataset

Now we work through this together. Load the provided dataset (`students_dataset.csv` in your materials) and run the two diagnostic functions every pandas user runs first.

```python
import pandas as pd

df = pd.read_csv("students_dataset.csv")

df.info()
df.describe()
```

### What `df.info()` tells you

- **Row count** — does it match what you expected? If the file should have 10,000 rows and `info` shows 9,847, somewhere 153 rows were dropped silently (often by a misconfigured `skiprows` or a malformed line that pandas skipped).
- **Column dtypes** — is `age` an `int64`, or did it come in as `object` (pandas-speak for "string")? An object dtype on a numeric column means there's at least one non-numeric value somewhere — maybe `"N/A"`, maybe `"unknown"`, maybe a stray space.
- **Non-null counts per column** — if `email` has 9,800 non-null entries out of 10,000, you have 200 missing emails. Is that expected? Is it a downstream problem?

### What `df.describe()` tells you

By default it summarizes only numeric columns: count, mean, std, min, 25%, 50%, 75%, max. You're hunting for:

- **Implausible mins or maxes.** Age min of `-3`? Age max of `999`? Sentinel values for missing data, encoded as numbers.
- **Suspicious means.** A `salary` column with mean `47,000` and max `4,700,000` — is that one real outlier or a data entry error (someone typed an extra zero)?
- **Std of zero.** A column with no variance is either a constant (drop it) or a bug.

For non-numeric columns, run `df.describe(include="object")` — it'll show count, unique, top, and frequency. If `country` has 10,000 rows and 47 unique values but you expected 5 countries, somebody has been entering "USA", "U.S.A.", "United States", "us", and " USA " (with a space) as separate values.

### Your task: write a 3-sentence diagnosis

After running `df.info()` and `df.describe()` on the provided dataset, write exactly three sentences that:

1. State the **shape and overall health** of the dataset (rows, columns, completeness).
2. Identify the **most concerning data quality issue** you can see and explain why it's a problem.
3. Recommend **one concrete cleaning step** you would take before any model touches this data.

Aim for the tone of a code review comment: specific, actionable, no hand-waving. "There's some missing data" is not a diagnosis. "The `signup_date` column is dtype `object` because 14% of rows contain the literal string `'unknown'`, which will silently break any time-based analysis" is a diagnosis.

We'll go around the room and read these out. Strong diagnoses look like the second example. Weak ones look like the first. The skill we're building is the eye that catches the second one before it ships.
