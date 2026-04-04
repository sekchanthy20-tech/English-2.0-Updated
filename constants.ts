import { Theme, StrictRule, AcademicLevel, InstructionTemplate } from './types';

export const INITIAL_MODULES = ['Grammar', 'Reading', 'Vocabulary'];

export const LANGUAGES = ['English', 'Khmer', 'Chinese', 'Korean', 'French'];

export const ACADEMIC_LEVELS: AcademicLevel[] = [
  'Kid', 'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 
  'Level 6', 'Level 7', 'Level 8', 'Level 9', 'Level 10', 'Level 11', 'TOEFL', 'IELTS'
];

export const THEMES: Theme[] = [
  { id: 'default', name: 'Academic Classic', color: '#ea580c', bg: '#ffffff', accent: '#f97316' },
  { id: 'modern', name: 'Modern Professional', color: '#0f172a', bg: '#ffffff', accent: '#334155' },
  { id: 'royal', name: 'Royal Blueprint', color: '#1e3a8a', bg: '#f8fafc', accent: '#3b82f6' },
  { id: 'forest', name: 'Forest Scholar', color: '#064e3b', bg: '#f0fdf4', accent: '#10b981' },
  { id: 'crimson', name: 'Crimson Archive', color: '#7f1d1d', bg: '#fef2f2', accent: '#ef4444' },
  { id: 'midnight', name: 'Midnight Architect', color: '#1e293b', bg: '#0f172a', accent: '#6366f1' },
  { id: 'beach', name: 'Tropical Beach', color: '#0284c7', bg: 'linear-gradient(to bottom, #bae6fd, #fef3c7)', accent: '#0ea5e9' },
  { id: 'sunset', name: 'Sunset Horizon', color: '#9d174d', bg: 'linear-gradient(to top right, #fdf2f8, #fff7ed)', accent: '#db2777' },
  { id: 'nebula', name: 'Deep Nebula', color: '#7c3aed', bg: 'radial-gradient(circle at center, #2e1065, #0f172a)', accent: '#8b5cf6' },
  { id: 'zen', name: 'Zen Garden', color: '#4d7c0f', bg: '#f7fee7', accent: '#65a30d' },
];

export const GLOBAL_STRICT_COMMAND = `### DPSS ULTIMATE TEST BUILDER: ELITE PROTOCOL ###
Enforce situational logic via prioritized rules.

--- 🧠 COGNITIVE INTEGRITY (MANDATORY) ---
1. [NEAR-MISS]: Every MCQ must have 1 contextually inferior "Near-Miss" distractor (grammatically correct but contextually wrong).
    - Example: "Angkor Wat is beautiful. You ____ visit it." (A. Have to [Incorrect - external obligation], B. Must [Correct - opinion/recommendation])
2. [NO-FREE-VERB]: Never place the main auxiliary or modal verb directly in the question stem if it reveals the structure. 
    - Weak: "You must ____ a helmet." 
    - Strong: "You ____ a helmet." (Options: A. must wear, B. have to wear, etc.)
    - This forces students to process meaning and choose the correct modal/auxiliary + verb form together.
3. [SITUATIONAL-EVIDENCE]: Grammar must be inferred from context/evidence, not obvious time markers (yesterday, now).
    - Weak: "She ____ her homework yesterday."
    - Strong: "Her notebook is closed. She ____ her homework." (Student must infer completion from evidence).
4. [PURE-VOCAB]: In vocabulary sections, all options must be the same part of speech and grammatical form.
5. [PRAGMATIC-BOUNDARY]: Distinguish between types of obligation and meaning in context.

--- ⚙️ STRUCTURAL & POSITIONAL CONTROL ---
6. [ITEM-SEPARATION]: Every numbered item (1., 2., 3., etc.) MUST start on a NEW LINE using an HTML <p> or <br> tag. DO NOT bunch them together in a single paragraph.
7. [ANSWER-FIRST]: Assign keys BEFORE content. BUCKET RANDOMIZATION: 10 items = 3A, 2B, 2C, 3D. Max 2 identical in a row.
8. [THE-SHUFFLE]: Randomize bucket order to destroy cycles (A-B-C-D). Every letter (A-D) must appear.
9. [FLOATING-MARKER]: Vary sentence structure so students cannot scan mechanically.
10. [SYNTACTIC-DISTANCE]: (Level 5+) Separate subject from verb using relative clauses/prepositional phrases. Mix simple, compound, and complex sentence styles (e.g., "Although," "Seeing her," "If...then").
11. [ADVANCED-COMP]: Test "as good a student as", "of the two", "the more..., the more...", "not so much A as B".
    - Example: "She is as good a student as my father is." (Precision grammar).

--- 🎨 LAYOUT & VISUALS ---
12. [SEPARATE-TABLES]: Use a separate HTML <table> for each PART.
13. [HEADER-STYLE]: Header row: Bold, Centered, White text, dark background (unless Instruction Background is enabled).
14. [COLUMN-BALANCE]: In 2-column layouts, distribute items EVENLY (e.g., 5+5). NEVER leave a column empty.
15. [MCQ-FORMAT]: 
    - Options MUST start on a new line below the question stem.
    - STRICT: You are FORBIDDEN from using "-> A. B. C. D." or similar inline shortcuts.
    - For short options: Use a nested HTML <table> with 4 columns (A, B, C, D) to ensure perfect alignment.
    - INDENTATION: You MUST put 7 non-breaking spaces (&nbsp;) before "A." in the first cell of the options table.
    - SPACING: Ensure there is clear visual space between options.
    - Example: <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A. Option One</td><td>B. Option Two</td>...
    - For long options: Double lines (A. & C. on top, B. & D. below). Use a nested 2-column table for perfect alignment.
    - NO vertical lists. NO 2x2 grids.

--- 🎭 SCENARIO & CONTENT ---
16. [SCENARIO-CHAOS]: Use unique, vivid scenarios. Forbidden from repeating themes.
17. [ANTI-ROBOT]: Forbidden from repetitive sentence starters. Randomize all subjects and lead-ins.
18. [TOPIC-OVERRIDE]: Topic box overrides template defaults. If topic is "Past Simple", ALL items (even Spelling) must be contextually linked.
19. [WORD-FORM-SHIFT]: Reading questions must not repeat exact wording from text (Paraphrase!).
20. [L1-SHADOW]: Include distractors reflecting common L1-to-L2 errors (e.g., "is go").
21. [FIREWALL]: Ensure no vocabulary/grammar in Part B leaks answers to Part A.
22. [NATURALIZE]: Replace 20% of formal verbs with phrasal verbs (e.g., "look into" instead of "investigate").

### PRIORITY: COGNITIVE INTEGRITY RULES ARE ABSOLUTE. ###
`;

export const PART_BACKGROUND_INSTRUCTION = `### PART BACKGROUND PROTOCOL ###
For each PART (A, B, C, etc.), apply a unique background style.
- If the part is in a <table>, apply the style to the <table> tag.
- If the part is a list, you MUST wrap the entire part (header + items) in a <div style="...">.
- MANDATORY: The background MUST be applied to a container that includes the instruction header.
- Ensure the background is clearly visible by using padding (e.g. padding: 15pt;).
Rotate between these styles:
1. Light Blue: background-color: #f0f9ff;
2. Soft Green: background-color: #f0fdf4;
3. Pale Yellow: background-color: #fffbeb;
4. Lavender: background-color: #f5f3ff;
5. Rose: background-color: #fff1f2;
6. NO BACKGROUND: background-color: transparent;
7. Forest Mist: background-image: linear-gradient(to bottom right, #f0fdf4, #dcfce7);
8. Ocean Calm: background-image: linear-gradient(to bottom right, #f0f9ff, #e0f2fe);
9. Mountain Air: background-image: linear-gradient(to bottom right, #f8fafc, #f1f5f9);

STRICT: Ensure text remains highly legible against these backgrounds.`;

export const INSTRUCTION_HEADER_BACKGROUND_INSTRUCTION = `### INSTRUCTION HEADER BACKGROUND PROTOCOL ###
For each PART (A, B, C, etc.), apply a unique background style ONLY to the instruction header row (the first row of the table).
Rotate between these styles for the header row:
1. Light Blue: background-color: #e0f2fe; color: #0369a1;
2. Soft Green: background-color: #dcfce7; color: #15803d;
3. Pale Yellow: background-color: #fef9c3; color: #a16207;
4. Lavender: background-color: #f3e8ff; color: #7e22ce;
5. Rose: background-color: #ffe4e6; color: #be123c;
6. Forest Mist: background-image: linear-gradient(to right, #dcfce7, #f0fdf4); color: #166534;
7. Ocean Calm: background-image: linear-gradient(to right, #e0f2fe, #f0f9ff); color: #075985;
8. Mountain Air: background-image: linear-gradient(to right, #f1f5f9, #f8fafc); color: #334155;

STRICT: When this protocol is active, the header row MUST NOT use the default dark background. Use dark text for high contrast.`;

export const PAGE_STYLES = [
  { id: 'p1', name: 'Elegant Gold', style: 'border: 15px solid transparent; border-image: url("https://www.transparenttextures.com/patterns/gold-scale.png") 30 round; padding: 25px; box-shadow: inset 0 0 10px rgba(0,0,0,0.1);' },
  { id: 'p2', name: 'Classic Scroll', style: 'border: 2px solid #8b4513; padding: 30px; background-color: #fdf5e6; border-radius: 5px; box-shadow: 5px 5px 15px rgba(0,0,0,0.2);' },
  { id: 'p3', name: 'Modern Blueprint', style: 'border: 1px solid #3b82f6; padding: 20px; background-image: radial-gradient(#3b82f6 0.5px, transparent 0.5px); background-size: 20px 20px; border-radius: 8px;' },
  { id: 'p4', name: 'Nature Leaf', style: 'border: 10px solid #10b981; border-style: double; padding: 20px; border-radius: 50px 5px 50px 5px;' },
  { id: 'p5', name: 'Royal Velvet', style: 'border: 8px solid #7f1d1d; outline: 2px solid #facc15; outline-offset: -5px; padding: 25px;' },
  { id: 'p6', name: 'Tech Grid', style: 'border: 2px solid #6366f1; padding: 20px; background: linear-gradient(90deg, #f8fafc 20px, transparent 1%) center, linear-gradient(#f8fafc 20px, transparent 1%) center, #cbd5e1; background-size: 22px 22px;' },
  { id: 'p7', name: 'Art Deco', style: 'border: 5px solid #1e293b; padding: 25px; background: linear-gradient(135deg, #f1f5f9 25%, transparent 25%) -50px 0, linear-gradient(225deg, #f1f5f9 25%, transparent 25%) -50px 0, linear-gradient(315deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, #f1f5f9 25%, transparent 25%); background-size: 100px 100px; background-color: #ffffff;' },
  { id: 'p8', name: 'Minimalist Zen', style: 'border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 40px 20px; text-align: justify;' },
  { id: 'p9', name: 'Vintage Typewriter', style: 'border: 1px solid #475569; padding: 30px; background-color: #f1f5f9; font-family: "Courier New", Courier, monospace;' },
  { id: 'p10', name: 'Ocean Breeze', style: 'border-left: 15px solid #0ea5e9; padding: 20px; background: linear-gradient(to right, #f0f9ff, #ffffff);' },
  { id: 'p11', name: 'Sunset Glow', style: 'border: 3px solid #f43f5e; padding: 20px; border-radius: 20px; box-shadow: 0 0 20px rgba(244, 63, 94, 0.1);' },
  { id: 'p12', name: 'Geometric Bold', style: 'border: 10px solid #0f172a; clip-path: polygon(0% 0%, 100% 0%, 100% 95%, 95% 100%, 0% 100%); padding: 25px;' },
  { id: 'p13', name: 'Soft Pastel', style: 'border: 5px solid #fdf2f8; padding: 20px; background-color: #fff1f2; border-radius: 30px;' },
  { id: 'p14', name: 'Industrial Steel', style: 'border: 4px solid #64748b; padding: 20px; background: repeating-linear-gradient(45deg, #f8fafc, #f8fafc 10px, #f1f5f9 10px, #f1f5f9 20px);' },
  { id: 'p15', name: 'Midnight Neon', style: 'border: 2px solid #818cf8; padding: 20px; box-shadow: 0 0 10px #818cf8, inset 0 0 5px #818cf8; border-radius: 10px;' },
  { id: 'p16', name: 'Classic Library', style: 'border-left: 10px solid #451a03; border-right: 1px solid #451a03; padding: 20px; background-color: #fffaf3;' },
  { id: 'p17', name: 'Modern Gallery', style: 'border: 1px solid #000; padding: 50px; background-color: #fff; box-shadow: 20px 20px 0px #e2e8f0;' },
  { id: 'p18', name: 'Botanical Garden', style: 'border: 2px solid #166534; padding: 20px; background-image: url("https://www.transparenttextures.com/patterns/leaf.png");' },
  { id: 'p19', name: 'Cosmic Star', style: 'border: 1px solid #4c1d95; padding: 20px; background: radial-gradient(circle, #ffffff 0%, #f5f3ff 100%);' },
  { id: 'p20', name: 'Urban Concrete', style: 'border: 6px solid #334155; padding: 20px; background-color: #f1f5f9; border-style: inset;' },
];

export const BORDER_FRAME_INSTRUCTION = `### STYLIST FRAME PROTOCOL ###
Wrap content in a beautiful randomized frame. Choose ONE style from this list for each generation:
1. Double Border: border: 4px double #ea580c; padding: 15px; border-radius: 12px;
2. Modern Shadow: border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
3. Royal Accent: border-left: 8px solid #1e3a8a; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 15px; border-radius: 4px;
4. Minimalist Dot: border: 2px dotted #94a3b8; padding: 15px; border-radius: 8px;
5. Gradient Glow: border: 1px solid #f97316; padding: 15px; border-radius: 20px; box-shadow: 0 0 15px rgba(249, 115, 22, 0.2);`;

export const DEFAULT_STRICT_RULES: StrictRule[] = [
  {
    id: 'rule-precision-1',
    label: 'CORE: PRECISION TRAP LOGIC',
    description: 'Forces secondary grammar nuances and near-miss distractors.',
    promptInjection: 'STRICT CORE: Every item must test a primary rule and a secondary nuance. Distractors must look 90% correct.',
    active: true,
    priority: 'High',
    category: 'Grammar'
  },
  {
    id: 'rule-logic-1',
    label: 'CORE: PATTERN DESTRUCTION',
    description: 'Rotate sentence structures to prevent predictable patterns.',
    promptInjection: 'STRICT CORE: Rotate sentence structures (Pos/Neg/Int). Max 2 identical structures in a row.',
    active: true,
    priority: 'High',
    category: 'General'
  },
  {
    id: 'rule-no-ai-speak',
    label: 'SUPPORT: NO AI-SPEAK',
    description: 'Ban robotic phrases like "views print" or "understands text".',
    promptInjection: 'STRICT SUPPORT: Ban "AI-speak" like "He knows lines" or "He views print". Use natural child-level actions.',
    active: true,
    priority: 'High',
    category: 'General'
  },
  {
    id: 'rule-no-markdown',
    label: 'SUPPORT: NO MARKDOWN',
    description: 'Ban asterisks. Use HTML tags only.',
    promptInjection: 'STRICT SUPPORT: HTML tags ONLY (<b>, <table>, <p>, <br>). No asterisks. DO NOT use <u> tags.',
    active: true,
    priority: 'High',
    category: 'General'
  }
];

export const DEFAULT_MASTER_PROTOCOLS: StrictRule[] = [
  { id: 'mp-human-centered', label: 'CORE: HUMAN-CENTERED ASSESSMENT', description: 'Enforces the Human-Centered Assessment Framework.', promptInjection: '### HUMAN-CENTERED ASSESSMENT FRAMEWORK ###\n1. [COGNITIVE-INTEGRITY]: Students must think. Measure understanding, not pattern recognition.\n2. [NO-FREE-VERB]: Never place main auxiliary/modal in stem if it reveals structure.\n3. [SITUATIONAL-EVIDENCE]: Infer grammar from context, not time markers.\n4. [PURE-VOCAB]: All options must be same part of speech/form.\n5. [FLOATING-MARKER]: Vary sentence structure.\n6. [SYNTACTIC-DISTANCE]: (Level 5+) Separate subject from verb with noise.\n7. [ADVANCED-COMP]: Test less common structures (as good a student as, of the two, the more..., the more...).\n8. [WORD-FORM-SHIFT]: Paraphrase reading questions.\n9. [PRAGMATIC-BOUNDARY]: Distinguish obligation types (must vs have to).', active: true, priority: 'High', category: 'General' },
  { id: 'mp-1', label: 'CORE: NEAR-MISS & MEANING TRAPS', description: 'Enforces professional-grade trap design and situational logic.', promptInjection: 'Every MCQ must include at least one "Near-Miss" distractor and focus on meaning-based traps (Must/Have to, Will/Going to, etc).', active: true, priority: 'High', category: 'Grammar' },
  { id: 'mp-2', label: 'CORE: SITUATIONAL INFERENCE', description: 'Forces inference from context, not time markers.', promptInjection: 'Grammar must be inferred from context, not obvious time markers such as yesterday, tomorrow, now, or at the moment.', active: true, priority: 'High', category: 'Grammar' },
  { id: 'mp-3', label: 'CORE: ANSWER ENTROPY (BUCKET)', description: 'Forces unpredictable answer distribution.', promptInjection: 'ANSWER-FIRST RULE: Assign keys BEFORE content using BUCKET RANDOMIZATION. Max 2 identical in a row.', active: true, priority: 'High', category: 'General' },
  { id: 'mp-4', label: 'CORE: GRAMMAR SYSTEM CONSISTENCY', description: 'Ensures distractors come from the same system.', promptInjection: 'All MCQ distractors should come from the same grammar system as the target structure.', active: true, priority: 'High', category: 'Grammar' },
  { id: 'mp-5', label: 'CORE: NO-FREE-VERB RULE', description: 'Prevents giving away the verb in the stem.', promptInjection: 'Never place the main auxiliary or modal verb directly in the question stem if it reveals the structure. Strong design: "You ____ a helmet." Options: A. must wear, B. have to wear.', active: true, priority: 'High', category: 'Grammar' },
  { id: 'mp-6', label: 'CORE: PURE VOCABULARY CONTROL', description: 'Ensures all options are the same part of speech.', promptInjection: 'In vocabulary sections, all answer choices must be the same part of speech and grammatical form.', active: true, priority: 'High', category: 'Vocabulary' },
  { id: 'mp-7', label: 'CORE: FLOATING MARKER', description: 'Varies sentence structure to prevent mechanical scanning.', promptInjection: 'Do not place key grammar signals in the same position every time. Vary sentence structure.', active: true, priority: 'High', category: 'General' },
  { id: 'mp-8', label: 'CORE: L1 INTERFERENCE', description: 'Includes distractors reflecting common L1 errors.', promptInjection: '[L1-SHADOW]: For at least 2 items, include a distractor that reflects a common L1-to-L2 error (e.g., "is go").', active: true, priority: 'High', category: 'General' },
  { id: 'mp-9', label: 'CORE: INFORMATION LEAK FIREWALL', description: 'Prevents answers from leaking between parts.', promptInjection: '[FIREWALL]: Ensure no vocabulary or grammar in Part B provides the answer to questions in Part A.', active: true, priority: 'High', category: 'General' },
  { id: 'mp-10', label: 'CORE: NATURALIZATION FILTER', description: 'Uses natural phrasal verbs.', promptInjection: '[NATURALIZE]: Replace 20% of formal verbs with natural phrasal verbs.', active: true, priority: 'High', category: 'General' },
  
  { id: 'mp-human-imperfection', label: 'SUPPORT: HUMAN IMPERFECTION', description: 'Breaks AI perfection patterns.', promptInjection: 'Allow controlled imperfection: uneven sentence lengths and varying stem complexity. Avoid over-formatting.', active: true, priority: 'Medium', category: 'General' },
  { id: 'mp-micro-context', label: 'SUPPORT: MICRO-THEME SYSTEM', description: 'Adds realistic mini scenarios and local names.', promptInjection: 'Use "Micro-Themes" and localized names (Sophea, Bora).', active: true, priority: 'High', category: 'Grammar' },
  
  { id: 'mp-reading-expert', label: 'OPTIONAL: EXPERT READING MODE', description: 'Enforces professional exam writer logic.', promptInjection: 'EXPERT READING: Use non-linear ordering, cognitive layering, and strict paraphrasing. Word Form Shift Rule: Reading questions must not repeat exact wording from text.', active: true, priority: 'High', category: 'Reading' },
  { id: 'mp-footer', label: 'OPTIONAL: GUARDIAN FOOTER', description: 'Adds the required quote and footer text.', promptInjection: 'Append a centered footer with 3 emojis, a randomized quote (Einstein, Robbins, etc), and the text: "Pre5-Chanthy-S2-20Copies-(Grammar)".', active: true, priority: 'Medium', category: 'General' }
];

export const INITIAL_TEMPLATES: InstructionTemplate[] = [
  // --- GRAMMAR MASTERY (REORDERED & UPDATED) ---
  { id: 'g_mcq', category: 'GRAMMAR', label: 'MCQ', professionalLabel: 'Choose the BEST option A, B, C or D to complete the following sentences.', prompt: 'Part: Choose the BEST option A, B, C or D to complete the following sentences testing {{TOPIC}}. Apply [NO-FREE-VERB]. Format: Put options on a new line below the question. Use a nested 4-column table for options. MANDATORY: Put 7 non-breaking spaces (&nbsp;) before "A." in the first cell for indentation. Apply PRAGMATIC BOUNDARY logic.', columnCount: 2 },
  { id: 'g_correct_incorrect', category: 'GRAMMAR', label: 'Correct/Incorrect', professionalLabel: 'Write C (correct) or I (incorrect).', prompt: 'Part: Write C (correct) or I (incorrect) for {{TOPIC}}. I need a space for students to write. Note: Use 4 non-break underscores ____. Apply PRAGMATIC BOUNDARY logic. Provide a space like "1. ____" for students to write.', columnCount: 2 },
  { id: 'g_circle', category: 'GRAMMAR', label: 'Circle', professionalLabel: 'Circle the correct answers.', prompt: 'Part: Circle the correct answers for {{TOPIC}}. STRICT: No MCQ options.', columnCount: 1 },
  { id: 'g_complete_sentences', category: 'GRAMMAR', label: 'Sentence Complete', professionalLabel: 'Complete the following sentences.', prompt: 'Part: Complete the following sentences for {{TOPIC}}. Note: Use 15 non-break underscores _______________ and provide the base verb in parentheses at the end of the blank.', columnCount: 1 },
  { id: 'g_pair', category: 'GRAMMAR', label: 'Double MCQ', professionalLabel: 'Double-gap MCQ testing two different aspects of {{TOPIC}} in one sentence.', prompt: 'Part: Double-gap MCQ testing two different aspects of {{TOPIC}} in one sentence. Select the correct pair of words to complete each sentence. Format: Put options on a new line below the question. Use a nested 4-column table for options to ensure they are perfectly aligned (A, B, C, D). Apply PRAGMATIC BOUNDARY logic.', columnCount: 1 },
  { id: 'g_spelling', category: 'GRAMMAR', label: 'Spelling Rules', professionalLabel: 'Spelling Rules.', prompt: 'Part: Spelling Rules. Complete the table following the spelling rules for the given words related to {{TOPIC}}. This is based on the lessons. STRICT: No MCQ options.', columnCount: 0 },
  
  // --- ADDITIONAL GRAMMAR ---
  { id: 'g_write_correct_form', category: 'GRAMMAR', label: 'Write Correct Form', professionalLabel: 'Write the correct form of …..', prompt: 'Part: Write the correct form of ….. for {{TOPIC}}. Note: Use 15 non-break underscores _______________.', columnCount: 1 },
  { id: 'g_rewrite_sentences', category: 'GRAMMAR', label: 'Rewrite Sentences', professionalLabel: 'Rewrite the following sentences.', prompt: 'Part: Rewrite the following sentences about {{TOPIC}}. I need a line for students to write. Provide a long blank line (_____________________________________________________) for each item.', columnCount: 1 },
  { id: 'g_box', category: 'GRAMMAR', label: 'Word Box', professionalLabel: 'Complete the following sentences using the words/ phrases in the box. Check the correct forms of grammar.', prompt: 'Part: Complete the following sentences using the words/ phrases in the box. Check the correct forms of grammar for {{TOPIC}}.', columnCount: 1 },
  { id: 'g_cloze_paragraph', category: 'GRAMMAR', label: 'Cloze Passage', professionalLabel: 'Cloze Passage (Full Paragraph): Fill in the blanks.', prompt: 'Part: Cloze Passage (Full Paragraph): Fill in the blanks with appropriate words for {{TOPIC}}.', columnCount: 1 },

  // --- FULL TEST COMBINATIONS ---
  { id: 'g_full_mastery', category: 'GRAMMAR', label: 'Grammar Mastery', professionalLabel: 'Complete the comprehensive grammar assessment covering all major structures.', prompt: 'PART: FULL GRAMMAR TEST. Generate a 4-part test. ITEM COUNT: Generate exactly {{COUNT}} items for EACH part. NUMBERING: Number every single item in each part starting from 1. PARTS: 1. Write C (correct) or I (incorrect), 2. MCQ, 3. Circle the correct answers, 4. Double-Gap MCQ. Apply NO-FREE-VERB mandate. Topic override: Ensure all items are contextually linked to {{TOPIC}}.', columnCount: 0 },
  { id: 'v_full_mastery', category: 'VOCABULARY', label: 'Vocabulary Mastery', professionalLabel: 'Complete the comprehensive vocabulary assessment to demonstrate lexical proficiency.', prompt: 'PART: FULL VOCABULARY TEST. Generate a 8-part test. ITEM COUNT: Generate exactly {{COUNT}} items for EACH part. NUMBERING: Number every single item in each part starting from 1. PARTS: 1. Definition Table, 2. Study Example, 3. Supply Key Terms, 4. Copy Exercises, 5. Syn Writing, 6. Circle, 7. MCQ, 8. Speaking Practice. Apply Pure Vocabulary Firewall. STRICT: NO Reading passages.', columnCount: 0 },
  { id: 'r_full_mastery', category: 'READING', label: 'Reading Comprehension', professionalLabel: 'Complete the comprehensive reading assessment to evaluate comprehension and inference skills.', prompt: 'PART: FULL READING TEST. Generate a 5-part test. ITEM COUNT: Generate exactly 10 items for EACH part. NUMBERING: Number every single item in each part starting from 1. COLUMN: 1 column layout. PARTS: 1. True/False, 2. MCQ, 3. Short Answers, 4. Inferential, 5. Critical Thinking. Use a DIFFERENT reading passage for each part. Length and level of thinking based on selected Academic Level. Apply Reading Logic Firewall.', columnCount: 1 },
  { id: 'g_copy', category: 'GRAMMAR', label: 'Copy', professionalLabel: 'Transcribe the following vocabulary exercises accurately into your notebook.', prompt: 'Part: Transcribe the following vocabulary exercises accurately into your notebook for {{TOPIC}}, but randomize the exercise numbers and order. STRICT: No MCQ options.', columnCount: 0 },
  { id: 'g_odd_one_out', category: 'GRAMMAR', label: 'Odd One', professionalLabel: 'Identify the grammatically incorrect sentence from the options provided.', prompt: 'Part: Identify the incorrect sentence from the options provided.', columnCount: 0 },
  { id: 'g_editing', category: 'GRAMMAR', label: 'Editing', professionalLabel: 'Identify and correct the grammatical errors in the following paragraph.', prompt: 'Part: Identify and correct the grammatical errors in the following paragraph. This is the mixed grammar test. The answer can be any types of grammar lessons. Correct all the mistakes.', columnCount: 0 },
  { id: 'g_reduce', category: 'GRAMMAR', label: 'Reduce', professionalLabel: 'Rewrite the following sentences by reducing them to fewer words while maintaining the original meaning.', prompt: 'Part: Rewrite the following sentences by reducing them to fewer words.', columnCount: 0 },
  { id: 'g_best_rewrite', category: 'GRAMMAR', label: 'Best Rewrite', professionalLabel: 'Choose the most appropriate rewrite for each of the following sentences.', prompt: 'Part: Choose the most appropriate rewrite for each sentence.', columnCount: 0 },
  { id: 'g_cloze_passage_short', category: 'GRAMMAR', label: 'Cloze', professionalLabel: 'Complete the cloze passage by filling in the blanks with appropriate grammatical forms.', prompt: 'Part: Complete the cloze passage by filling in the blanks with appropriate words.', columnCount: 0 },
  
  // READING
  { id: 'r_tf_stmt', category: 'READING', label: 'True/False', professionalLabel: 'Read the following statements and determine if they are True or False based on the text.', prompt: 'Part: Read the following statements and determine if they are True or False based on the text about {{TOPIC}}. Follow with True/ False statements using heavy synonyms and word-form changes. Use style "1. (_____)" (5 underscores). STRICT: No MCQ options.', columnCount: 1 },
  { id: 'r_mcq', category: 'READING', label: 'MCQ', professionalLabel: 'Choose the appropriate options A, B, C or D based on the detailed reading passage.', prompt: 'Part: Choose the appropriate options A, B, C or D based on the detailed reading passage about {{TOPIC}}. Follow with MCQ testing critical thinking. Format: Put options on a new line below the question. Use a nested 4-column table for options. MANDATORY: Put 7 non-breaking spaces (&nbsp;) before "A." in the first cell for indentation.', columnCount: 1 },
  { id: 'r_short_answer', category: 'READING', label: 'Short Answer', professionalLabel: 'Complete the summary using no more than two words or a number from the text.', prompt: 'Part: Complete the summary using no more than two words or a number from the text about {{TOPIC}}. Follow with fill-in-the-blank summary sentences requiring exact words from the text. STRICT: No MCQ options.', columnCount: 1 },
  { id: 'r_inferential', category: 'READING', label: 'Inferential', professionalLabel: 'Answer the following inferential questions based on the author\'s perspective.', prompt: 'Part: Answer the following inferential questions based on the author\'s perspective about {{TOPIC}}. Follow with discussion questions testing author attitude and implications. STRICT: No MCQ options.', columnCount: 1 },
  { id: 'r_critical_thinking', category: 'READING', label: 'Critical Thinking', professionalLabel: 'Apply critical thinking to answer the following questions based on the analytical reading of the text.', prompt: 'Part: Apply critical thinking to answer the following questions based on the text.', columnCount: 1 },
  { id: 'r_tfng', category: 'READING', label: 'T/F/NG Analysis', professionalLabel: 'Read the text and indicate whether the statements are True, False, or Not Given.', prompt: 'Part: Read the text and indicate whether the statements are True, False, or Not Given about {{TOPIC}}. Follow with True/False/Not Given questions testing information boundaries. Use style "1. (_____)" (5 underscores). STRICT: No MCQ options.', columnCount: 0 },
  { 
    id: 'r_mcq_expert', 
    category: 'READING', 
    label: 'Expert MCQ', 
    professionalLabel: 'Choose the correct option A, B, C or D based on an expert-level analysis of the text.', 
    prompt: 'Part: Choose the correct option A, B, C or D based on an expert-level analysis of the text. Apply [LEXICAL OVERLAP TRAP]. Distractors must include: 1. A "Partial Truth" (mentioned in the text but incomplete), 2. An "Opposite," and 3. A "Contextual Misfit." Apply Zero-Keyword Matching.', 
    columnCount: 0 
  },
  { 
    id: 'r_referential_qs', 
    category: 'READING', 
    label: 'Referential', 
    professionalLabel: 'Determine the referential resolution for the specified pronouns in the passage.', 
    prompt: 'Part: Determine the referential resolution for the specified pronouns in the passage. This tests structural understanding.', 
    columnCount: 0 
  },
  { 
    id: 'r_summary_cloze', 
    category: 'READING', 
    label: 'Summary', 
    professionalLabel: 'Complete the summary of the passage by filling in the blanks with words from the text.', 
    prompt: 'Part: Complete the summary of the passage by filling in the blanks with words from the text. Students must find the correct words from the text to fill the blanks. Use exact word-form from the text.', 
    columnCount: 0 
  },

  // VOCABULARY
  { id: 'v_study_table', category: 'VOCABULARY', label: 'Definition Table', professionalLabel: 'Study the following vocabulary words and their corresponding definitions.', prompt: 'Part: Study the following vocabulary words and their corresponding definitions. Use a 2-column HTML table. Column 1: Number + Word/Phrase. Column 2: Easy Definition. STRICT: No MCQ options.', columnCount: 1 },
  { id: 'v_sentence_study', category: 'VOCABULARY', label: 'Study Example', professionalLabel: 'Study the usage of the following vocabulary words in the provided sentences.', prompt: 'Part: Study the usage of the following vocabulary words in the provided sentences. STRICT: No MCQ options. These are example sentences for learning.', columnCount: 1 },
  { id: 'v_supply_terms', category: 'VOCABULARY', label: 'Supply Key Terms', professionalLabel: 'Read the definitions and provide the correct key terms.', prompt: 'Part: Read the definitions and provide the correct key terms. Use a 2-column HTML table. Column 1: Easy Definition. Column 2: Blank line for Key Term. Randomize order. STRICT: No MCQ options.', columnCount: 1 },
  { id: 'v_box', category: 'VOCABULARY', label: 'Vocabulary Box', professionalLabel: 'Complete the following sentences using the correct words or phrases from the box.', prompt: 'Part: Complete the following sentences using the correct words or phrases from the box. Use long blanks. STRICT: No MCQ options.', columnCount: 1 },
  { id: 'v_matching', category: 'VOCABULARY', label: 'Definition Match', professionalLabel: 'Match the following vocabulary words with their appropriate definitions.', prompt: 'Part: Match the following vocabulary words with their appropriate definitions. Use a standard list format. STRICT: No MCQ options.', columnCount: 1 },
  { id: 'v_copy', category: 'VOCABULARY', label: 'Copy', professionalLabel: 'Transcribe the following vocabulary exercises accurately into your notebook.', prompt: 'Part: Transcribe the following vocabulary exercises accurately into your notebook. STRICT: No MCQ options.', columnCount: 1 },
  { id: 'v_synonym_swap', category: 'VOCABULARY', label: 'Synonym Swap', professionalLabel: 'Rewrite each sentence by replacing the underlined word with an appropriate synonym.', prompt: 'Part: Rewrite each sentence by replacing the underlined word with an appropriate synonym. Use a long blank line. STRICT: No MCQ options.', columnCount: 1 },
  { id: 'v_mcq', category: 'VOCABULARY', label: 'MCQ', professionalLabel: 'Choose the appropriate options A, B, C or D to complete each sentence.', prompt: 'Part: Choose the appropriate options A, B, C or D to complete each sentence. Format: Put options on a new line below the question. Use a nested 4-column table for options. MANDATORY: Put 7 non-breaking spaces (&nbsp;) before "A." in the first cell for indentation. Apply Grammar Blackout.', columnCount: 1 },
  { id: 'v_tf', category: 'VOCABULARY', label: 'T/F', professionalLabel: 'Read the statements and indicate whether they are True (T) or False (F).', prompt: 'Part: Read the statements and indicate whether they are True (T) or False (F). Use style "1. (_____)" (5 underscores). STRICT: No MCQ options.', columnCount: 1 },
  { id: 'v_speaking', category: 'VOCABULARY', label: 'Speaking', professionalLabel: 'Discuss the following questions with a partner to practice your speaking skills.', prompt: 'Part: Discuss the following questions with a partner to practice your speaking skills. Generate open-ended discussion questions related to {{TOPIC}}. STRICT: No MCQ options.', columnCount: 1 },
  { id: 'v_synonyms', category: 'VOCABULARY', label: 'Synonyms', professionalLabel: 'Provide appropriate synonyms for the vocabulary words in the table.', prompt: 'Part: Provide appropriate synonyms for the vocabulary words in the table.\n5 columns: 1 vocabulary, 2 synonym 1, 3, syn 2, ....\nIf there are more than 5 synonyms, please have another row.', columnCount: 5 },
  { id: 'v_synonym_writing', category: 'VOCABULARY', label: 'Syn Writing', professionalLabel: 'Complete the synonym writing task as instructed.', prompt: 'Part: Complete the synonym writing task as instructed.\n5 columns: 1 vocabulary, 2 synonym 1, 3, syn 2, ....\nIf there are more than 5 synonyms, please have another row.', columnCount: 1 },
  { id: 'v_circle', category: 'VOCABULARY', label: 'Circle', professionalLabel: 'Circle the correct vocabulary word from the options provided in parentheses.', prompt: 'Part: Circle the correct word from the options provided.', columnCount: 0 },
  { id: 'v_cloze', category: 'VOCABULARY', label: 'Cloze', professionalLabel: 'Complete the cloze passage by filling in the blanks with appropriate vocabulary from the text.', prompt: 'Part: Complete the cloze passage by filling in the blanks with appropriate vocabulary.', columnCount: 0 }
];
