import { Subject } from '@/types';

/**
 * Strict Education-Only Keyword Bank
 */
const EDUCATION_KEYWORDS = [
  'math', 'algebra', 'calculus', 'geometry', 'trigonometry', 'statistic', 'equation', 'formula',
  'physics', 'newton', 'gravity', 'quantum', 'thermodynamic', 'optics', 'force', 'energy',
  'chemistry', 'molecule', 'atom', 'periodic', 'reaction', 'organic', 'acid', 'base', 'periodic table',
  'biology', 'cell', 'dna', 'evolution', 'organism', 'anatomy', 'plant', 'animal', 'microbiology',
  'english', 'grammar', 'literature', 'poem', 'prose', 'novel', 'verb', 'noun', 'syntax',
  'computer science', 'programming', 'code', 'python', 'java', 'algorithm', 'data structure', 'network', 'database', 'os',
  'history', 'geography', 'civic', 'economy', 'social', 'study', 'education', 'learning', 'lesson',
  'homework', 'assignment', 'exam', 'test', 'quiz', 'syllabus', 'curriculum', 'grade',
  'theorem', 'proof', 'derive', 'solve', 'function', 'variable', 'integral', 'derivative',
  'quadratic', 'polynomial', 'fraction', 'logarithm', 'exponent', 'prime', 'factor',
  'photosynthesis', 'mitosis', 'meiosis', 'chromosome', 'enzyme', 'protein',
  'velocity', 'acceleration', 'momentum', 'circuit', 'wavelength', 'frequency',
  'oxidation', 'reduction', 'stoichiometry', 'molar', 'concentration',
  'binary', 'sorting', 'recursion', 'stack', 'queue', 'tree', 'graph',
  'explain', 'define', 'describe', 'compare', 'analyze', 'evaluate', 'summarize',
  'notes', 'revision', 'concept', 'principle', 'theory', 'law',
];

/**
 * Subject-Specific Keyword Banks — expanded for broader coverage
 */
const SUBJECT_KEYWORDS: Record<Exclude<Subject, 'general'>, string[]> = {
  mathematics: [
    'math', 'number', 'algebra', 'calculus', 'geometry', 'stat', 'probabilit',
    'integral', 'derivative', 'equation', 'matrix', 'vector', 'theorem',
    'quadratic', 'formula', 'polynomial', 'fraction', 'decimal', 'percent',
    'logarithm', 'exponent', 'prime', 'factor', 'divisib', 'remainder',
    'triangle', 'circle', 'area', 'volume', 'perimeter', 'angle', 'radius',
    'trigonometr', 'sine', 'cosine', 'tangent', 'pythagora',
    'solve', 'calculate', 'compute', 'simplif', 'graph', 'plot', 'function',
    'linear', 'cubic', 'root', 'square', 'ratio', 'proportion',
    'arithmetic', 'sequence', 'series', 'summation', 'limit', 'differential',
    'set', 'subset', 'union', 'intersect', 'logic', 'proof', 'induct',
    'permutation', 'combination', 'binomial', 'coefficient',
    'coordinate', 'slope', 'intercept', 'parabola', 'hyperbola', 'ellipse',
    'determinant', 'eigenvalue', 'transform', 'fourier', 'laplace',
    'add', 'subtract', 'multipl', 'divid', 'modulus',
  ],
  physics: [
    'physic', 'newton', 'einstein', 'gravity', 'mechanic', 'wave', 'light',
    'electric', 'magnetic', 'nuclear', 'relativity', 'energy', 'force', 'momentum',
    'velocity', 'acceleration', 'friction', 'torque', 'pressure', 'density',
    'circuit', 'resistor', 'capacitor', 'inductor', 'voltage', 'current', 'ohm',
    'optic', 'refraction', 'reflection', 'lens', 'mirror', 'prism', 'spectrum',
    'thermodynamic', 'entropy', 'heat', 'temperature', 'conduction', 'convection',
    'quantum', 'photon', 'electron', 'proton', 'neutron', 'atom',
    'wavelength', 'frequency', 'amplitude', 'oscillat', 'pendulum', 'spring',
    'work', 'power', 'kinetic', 'potential', 'conservation',
    'gravitation', 'orbit', 'planet', 'satellite', 'kepler',
    'semiconductor', 'diode', 'transistor', 'amplifier',
  ],
  chemistry: [
    'chemist', 'atom', 'molecule', 'reaction', 'periodic', 'element', 'organic',
    'inorganic', 'bond', 'ph ', 'acid', 'base', 'solution', 'molar',
    'oxidation', 'reduction', 'redox', 'electrolysis', 'electrochemist',
    'stoichiometr', 'concentration', 'dilut', 'titrat',
    'compound', 'mixture', 'alloy', 'metal', 'nonmetal',
    'carbon', 'hydrogen', 'oxygen', 'nitrogen', 'halogen', 'noble gas',
    'isomer', 'polymer', 'monomer', 'catalyst', 'enzyme',
    'covalent', 'ionic', 'metallic', 'hydrogen bond', 'van der waals',
    'gas', 'liquid', 'solid', 'plasma', 'phase', 'boiling', 'melting',
    'equilibrium', 'le chatelier', 'rate', 'rate law',
    'nucleus', 'isotope', 'radioactiv', 'half-life', 'decay',
  ],
  biology: [
    'biolog', 'cell', 'gene', 'dna', 'rna', 'evolution', 'organ', 'plant',
    'animal', 'human', 'ecolog', 'species', 'anatomy', 'brain', 'heart',
    'photosynthesis', 'respiration', 'mitosis', 'meiosis', 'chromosome',
    'protein', 'enzyme', 'amino acid', 'lipid', 'carbohydrate',
    'bacteria', 'virus', 'fungus', 'microbe', 'pathogen', 'immune',
    'blood', 'muscle', 'bone', 'nerve', 'tissue', 'digestion',
    'reproduction', 'embryo', 'fetus', 'genetic', 'heredit', 'allele',
    'darwin', 'natural selection', 'mutation', 'adaptation',
    'ecosystem', 'food chain', 'biodiversity', 'habitat', 'biome',
    'taxonomy', 'kingdom', 'phylum', 'class', 'order', 'family', 'genus',
    'organelle', 'mitochondria', 'chloroplast', 'nucleus', 'membrane',
  ],
  english: [
    'english', 'lit', 'grammar', 'write', 'read', 'poem', 'poetry',
    'story', 'novel', 'author', 'essay', 'vocab', 'tense', 'sentence',
    'shakespeare', 'word', 'paragraph', 'thesis', 'argument', 'rhetoric',
    'metaphor', 'simile', 'alliteration', 'personification', 'irony',
    'narrative', 'character', 'plot', 'theme', 'setting', 'conflict',
    'pronoun', 'adjective', 'adverb', 'preposition', 'conjunction',
    'spelling', 'punctuation', 'comma', 'semicolon', 'clause',
    'comprehension', 'inference', 'summariz', 'paraphrase',
    'fiction', 'nonfiction', 'drama', 'sonnet', 'stanza',
    'active voice', 'passive voice', 'subject', 'predicate', 'object',
    'synonym', 'antonym', 'homophone', 'idiom', 'proverb',
  ],
  computer_science: [
    'computer', 'program', 'algorithm', 'code', 'python', 'java', 'script',
    'network', 'db', 'data structure', 'variable', 'loop', 'function', 'class',
    'binary', 'boolean', 'array', 'list', 'stack', 'queue', 'tree', 'graph',
    'sorting', 'searching', 'recursion', 'iteration', 'complexity', 'big o',
    'object oriented', 'inheritance', 'polymorphism', 'encapsulation',
    'html', 'css', 'javascript', 'react', 'node', 'api', 'rest',
    'database', 'sql', 'nosql', 'query', 'table', 'schema',
    'operating system', 'process', 'thread', 'memory', 'cpu', 'kernel',
    'tcp', 'ip', 'http', 'protocol', 'router', 'server', 'client',
    'encrypt', 'decrypt', 'hash', 'cyber', 'security',
    'machine learning', 'artificial intelligence', 'neural network',
    'compiler', 'interpreter', 'syntax', 'debug', 'error', 'exception',
    'git', 'version control', 'deploy', 'cloud',
    'software', 'hardware', 'input', 'output', 'storage',
  ],
  telugu: ['telugu', 'padhyam', 'gadhyam', 'grammar', 'language', 'sahityam', 'kavithvam'],
  hindi: ['hindi', 'vyakaran', 'kavitha', 'language', 'sahitya', 'rachna', 'nibandh'],
  programming: [
    'code', 'python', 'java', 'debugging', 'software', 'program',
    'algorithm', 'function', 'variable', 'loop', 'array', 'string',
    'class', 'object', 'method', 'constructor', 'interface',
    'compile', 'runtime', 'syntax', 'error', 'exception',
    'api', 'library', 'framework', 'module', 'package',
    'c++', 'c#', 'ruby', 'go', 'rust', 'swift', 'kotlin',
    'web', 'app', 'backend', 'frontend', 'fullstack',
  ]
};

/**
 * Checks if a query is education-related based on a broad keyword list.
 * More lenient to avoid false rejections of legitimate academic questions.
 */
export function isEducationQuery(message: string): boolean {
  const lowerMsg = message.toLowerCase();
  
  // Check for common academic terms
  const hasAcademicTerm = EDUCATION_KEYWORDS.some(keyword => lowerMsg.includes(keyword));
  
  // Check for common question starters often used in education
  const questionStarters = [
    'what is', 'what are', 'how to', 'how do', 'how does', 'how can',
    'explain', 'suggest', 'define', 'summary of', 'derive', 'prove', 'solve',
    'describe', 'compare', 'calculate', 'find the', 'give me', 'tell me about',
    'what does', 'why is', 'why do', 'why does', 'when did', 'when was',
    'list the', 'name the', 'state the', 'write a', 'convert',
    'differentiate', 'distinguish', 'elaborate', 'illustrate',
  ];
  const isQuestion = questionStarters.some(starter => lowerMsg.includes(starter));

  // Also check if any subject keyword matches (cross-check with all subjects)
  const hasSubjectKeyword = Object.values(SUBJECT_KEYWORDS).some(
    keywords => keywords.some(keyword => lowerMsg.includes(keyword))
  );

  return hasAcademicTerm || hasSubjectKeyword || (isQuestion && lowerMsg.length > 10);
}

/**
 * Checks if a query matches the selected subject.
 * Uses keyword matching but also allows questions with educational question starters
 * to pass through to the AI (which has its own subject-matching in the system prompt).
 */
export function isSubjectMatch(message: string, subject: Subject): boolean {
  if (subject === 'general') return true;
  
  const keywords = SUBJECT_KEYWORDS[subject as Exclude<Subject, 'general'>] || [];
  const lowerMsg = message.toLowerCase();
  
  // Direct keyword match
  if (keywords.some(keyword => lowerMsg.includes(keyword))) return true;

  // If the question starts with a common academic question pattern,
  // let it pass to the AI rather than blocking it with a false negative.
  // The AI system prompt has its own subject validation as a second layer.
  const academicPatterns = [
    'what is', 'what are', 'how to', 'how do', 'explain', 'define',
    'solve', 'calculate', 'find', 'prove', 'derive', 'describe',
    'give me', 'tell me', 'help me', 'write', 'convert', 'simplify',
    'compare', 'list', 'state', 'name', 'summarize', 'notes',
  ];
  if (academicPatterns.some(p => lowerMsg.startsWith(p) || lowerMsg.includes(p))) {
    return true;
  }

  return false;
}

/**
 * Helper to identify the likely subject of a query (for logging or smarter rejection)
 */
export function identifyLikelySubject(message: string): Subject | null {
  const lowerMsg = message.toLowerCase();
  for (const [subj, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
    if (keywords.some(k => lowerMsg.includes(k))) return subj as Subject;
  }
  return null;
}
