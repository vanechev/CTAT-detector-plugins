# CTAT-detector-plugins

**CTAT main repository**

https://github.com/CMUCTAT/CTAT

**General features: coming soon / in development** 

- [link to documentation and resources for extended CTAT tools: build your own detectors]

- **the detector development and testing tools (...placeholder until we have a better/shorter name for this :) )**
	- **Motivation:** 
		- In the absence of strong pre-existing theory, specified at a fairly fine-grained level, it can be difficult to know how best to design **effective micro-interventions** in an ITS (e.g., **how** should a tutor adapt at the step-level, and **in response to what?**)  or teacher-facing analytics displays that could **support effective interventions**. 
		- ITS detectors are commonly **developed** using log data (e.g., GIFT's authoring tools explicitly support data-driven detector development, using log data) and/or **evaluated** using log data (e.g., under the "discovery with models" approach, correlations may be assessed between a detector's output and the output of other detectors, posttests, or external measures of student performance and learning behaviors).
		
	- In order to design **effective** analytics-driven ITSs and dashboards, we must strive to evaluate, as directly as possible:
		- the **expected causal impact** of a particular micro-intervention (and the usefulness of a **particular** set of analytics/detectors/measures in informing the relevant decision-makers of true **opportunities for intervention**
		- the **expected usability** of analytics, when embedded in particular systems, for use in particular contexts, by members of a particular user population
		
	- **Features:** 
		- Make use of both built-in and custom methods, to use historical data from intelligent tutoring systems (accepts DataShop export formats) in order to **estimate** the relative **causal impact** of…
			- different student behaviors/states on learning
			- potential interventions on these student behaviors/states
			- ...
			
		- Methods to evaluate usability
			- Teacher-level (e.g., for a next-day use dashboard or reporting system)
				- ...
			- Classroom-level (e.g., for real-time teacher or peer-tutoring support tools)
				- ...
			- Student-level (e.g., for use in a student dashboard, or in driving ITS adaptivity)
				- ...
				
________________________________

**Coming at some point... perhaps?**

Workshop (or similar event) to researcher-source CTAT detectors (and cool applications of detectors)
^ Similar to the LearnSphere workshop last year
[EDM folk, in particular: "You may find that skills you've developed for writing **offline analyses of log data** translate quite well to writing **online detectors** for use with CTAT tutors and TutorShop"]
[FWIW: the EDM workshop proposal deadline is **February 21st, 2017**]

________________________________

**Current examples:**
- **error categorizer:** 
	- Description: keeps a count of student errors, categorized under a particular canonicalization scheme
	- Outputs: mapping from observed student error categories to
		- running, per-student count of observations
		- raw examples (i.e., non-canonicalized)
	- Potential extensions: 
		- Recency (i.e., decay function)
		- associate every update from an **error categorizer** with a reference to the particular problem instance (I believe this is already included on TutorShop's end)
	- Current canonicalization schemes include:
		- Simple canonicalization: line-to-line transition representation
			- **Example 1**
				- input:   x + 6 = 15   ->   x + 6 - 6 = 15
				- output:  x + a = b    ->   x + a - a = b
			- **Example 2**
				- input:   x + 6 = 15 -> 6 = 15
				- output:  x + a = b  -> a = b
			- **Example 3**
				- input:    x + 6 = 15 -> x = 15 + 6
				- output:   x + a = b  -> x = b + a
			
		- Simple canonicalization: track changes
			- ![example](https://raw.githubusercontent.com/d19fe8/CTAT-detector-plugins/master/Screen%20Shot%202017-01-22%20at%204.14.46%20PM.png)
			- ![example](https://raw.githubusercontent.com/d19fe8/CTAT-detector-plugins/master/Screen%20Shot%202017-01-22%20at%204.18.39%20PM.png)
			- ![example](https://raw.githubusercontent.com/d19fe8/CTAT-detector-plugins/master/Screen%20Shot%202017-01-22%20at%204.23.10%20PM.png)
			
			- **Example 1**
				- input:   x + 6 = 15   ->   x + 6 - 6 = 15
				- output:  x + a **- a** = b
			- **Example 2**
				- input:   x + 6 = 15 -> 6 = 15 
				- output:  **[x +]** a = b
			- **Example 3**
				- input:   x + 6 = 15 -> x = 15 + 6
				- output:  x **[+ 6]** = 15 **+ 6**
			
		- Change-based canonicalization: an extra layer over "track changes", which shows **only what changes between two lines in Lynnette** (and thus produces **fewer** categories, more focused on abstract **transformations**)
		
			- ![example](https://raw.githubusercontent.com/d19fe8/CTAT-detector-plugins/master/Screen%20Shot%202017-01-22%20at%204.24.00%20PM.png)
		
			- **Example 1**
				- input:   x + 6 = 15   ->   x + 6 - 6 = 15
				- output:  ... - a = ...
			- **Example 2**
				- input:   x + 6 = 15 -> 6 = 15
				- output:  [x] ... = ...
			- **Example 3**
				- input:    x + 6 + 3 = 15 -> x + 3 = 15 + 6
				- output:   ... [+ 6] ... = ... + 6
			- **Example 4**
				- input:    x + 6 + 3 - 2 = 15 -> x + 6 + 3 - 2 = 15 + 6
				- output:   ... [+ 6] ... = ... + 6
			
	- In-development canonicalization schemes include:
		- Labeled error categories (verbal category descriptions, which DO NOT infer underlying misconceptions)
			- **Example 1**
				- input:  
				- output:
			- **Example 2**
				- input:  
				- output:
			- **Example 3**
				- input:  
				- output:
		- Inferred misconceptions (verbal category descriptions, which DO infer underlying misconceptions)
			- Misconception labeling scheme 1
				- **Example 1**
					- input:  
					- output:
				- **Example 2**
					- input:  
					- output:
				- **Example 3**
					- input:  
					- output:
			- Misconception labeling scheme 2
				- **Example 1**
					- input:  
					- output:
				- **Example 2**
					- input:  
					- output:
				- **Example 3**
					- input:  
					- output:
			- Misconception labeling scheme 3
				- **Example 1**
					- input:  
					- output:
				- **Example 2**
					- input:  
					- output:
				- **Example 3**
					- input:  
					- output:
			- ....
			
	- Don't like any of the above canonicalization schemes (and/or misconception labeling schemes)? Please contribute to this collection by creating your own canonicalization function, and feel free to use one of our examples as a guiding template.


- **current-step error count**

- **stagnation**

________________________________

**In-development:**
- **help-seeking models**
	- Current help-seeking models include
		- ...
		- ...
		
	- In-development help-seeking models include
	
- **BKT**
	- at least one variant of BKT and at least one BKT-driven detector
		- predictive stability
		- possibly: BKT + contextual guess and slip --> Arroyo et al., carelessness detector
		
- **a cognitive gaming detector**

________________________________

**For the future:**
  
- at least one detector of a student's affective state (boredom detector tends to have higher accuracy than other affect detectors)
