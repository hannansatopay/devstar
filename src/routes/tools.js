export let tools = {
	
	// String Utility Tools Start
	'add-prefix-suffix': {
        name: 'Add Prefix and Suffix',
		icon: 'code',
        link: '/add-prefix-suffix',
        description: 
		"Easily modify your text lines by adding custom prefixes and suffixes with our Prefix and Suffix Adder Tool. Input your text, specify the desired prefix and suffix, and watch as it instantly modifies each line according to your preferences. Perfect for formatting lists, coding snippets, or creating structured data. Empower your text editing tasks with this convenient tool, ensuring consistent formatting in various contexts."
    },
	'ascii-encode-decode': {
        name: 'ASCII Encoder & Decoder',
		icon: 'code',
        link: '/ascii-encode-decode',
        description:
		"Dive into the fundamentals of digital text with our ASCII Encoder and Decoder Tool. Encode your text into ASCII, translating characters into numerical codes for digital representation. Input your content, and witness it transform into a series of digits, ideal for computer systems and data transmission. Alternatively, decode ASCII back into readable text effortlessly, bridging the gap between numeric codes and human-readable characters. Perfect for programmers, developers, and tech enthusiasts, our tool simplifies the encoding and decoding of ASCII characters, ensuring seamless integration into digital environments and data processing tasks." 
    },
	'base64-encode-decode': {
        name: 'Base64 Encoder & Decoder',
		icon: 'code',
        link: '/base64-encode-decode',
        description: 
        "Experience seamless data transformation with our Base64 Encoder and Decoder tool. Whether you need to encode sensitive information or decode encoded data, our user-friendly interface simplifies the process. Input your text or encoded string, and our tool swiftly converts it to Base64 format or decodes it back to its original form. Perfect for developers, security professionals, and anyone dealing with data manipulation tasks. Explore the efficiency of Base64 encoding and decoding effortlessly, ensuring secure communication and efficient data handling. Start encoding and decoding with ease, empowering your digital endeavors."
    },
	'binary-text-converter': {
        name: 'Binary Text Converter',
		icon: 'code',
        link: '/binary-text-converter',
        description:
		"Transform text into a digital language or decode binary data with our Text to Binary and Binary to Text Converter Tool. Input your text, and instantly convert it into binary code, allowing seamless integration into digital systems or secure data transmission. Conversely, input binary digits, and watch them transform back into human-readable text. Ideal for programmers, cybersecurity professionals, and tech enthusiasts, our tool simplifies data conversion tasks. Whether you're working with computer protocols, coding messages, or decoding binary files, our converter ensures accuracy and efficiency. Start converting text to binary and vice versa with ease, bridging the gap between human language and digital communication." 
    },
	'case-converter': {
		name: 'Case Converter',
		icon: 'code',
		link: '/case-converter',
		description:
		"Effortlessly convert text between uppercase, lowercase, title case, or sentence case with our Case Converter Tool. Input your text, select the desired conversion type, and witness your text transform instantly. Ideal for writers, editors, and programmers, our tool streamlines text formatting tasks. Ensure uniformity in your documents, coding projects, and communications. Enhance readability and professionalism by converting text to your preferred case style."
	},
	'email-validator': {
        name: 'Email Validator',
		icon: 'code',
        link: '/email-validator',
        description: 
		"Ensure accurate communication with our Email Validator, a robust tool designed to validate email addresses swiftly and efficiently. Input an email address, and our validator meticulously checks its format, domain validity, and existence, ensuring you're sending messages to genuine recipients. Perfect for marketers, businesses, and developers, our tool minimizes bounce rates, enhances email deliverability, and maintains your sender reputation. Safeguard your communication channels from invalid or suspicious addresses, ensuring your emails reach the right audience every time. Enhance your email outreach with our reliable Email Validator, your key to seamless and reliable online correspondence."
	},
	'escape-unescape-text': {
        name: 'Escape & Unescape Text',
		icon: 'code',
        link: '/escape-unescape-text',
        description: 
		"Elevate your text manipulation tasks with our Escape and Unescape Text Tool. Whether you need to escape special characters for safe transmission or unescape encoded strings, our intuitive tool simplifies the process. Input your text, and watch as it seamlessly escapes special characters or reverses the process, restoring your text to its original form. Ideal for programmers, web developers, and content creators dealing with HTML, URLs, or JavaScript strings. Enhance your workflow by effortlessly handling special characters and encoded text. Start escaping and unescaping with ease, ensuring accurate data representation in any context."	
	},
	'find-and-replace-text': {
		name: 'Find and Replace Text',
		icon: 'code',
		link: '/find-and-replace-text',
		description:
		"Simplify your text editing with our Find and Replace Tool. Quickly locate specific words or phrases within your text and replace them with new content. Input your text, specify the target phrase, replacement, and watch as it efficiently updates your text. Ideal for proofreading, content editing, or code refactoring. Boost your productivity by automating the tedious task of manual text replacements."
	},
	'hex-text':{
        name: 'Hex Text Converter',
		icon: 'code',
        link: '/hex-text',
        description: 
		"Bridge the gap between human language and machine code effortlessly with our Hex to Text and Text to Hex Converter Tool. Input hexadecimal data, and convert it into readable text or input text and convert it into hexadecimal representation. Perfect for developers, cybersecurity experts, and tech enthusiasts dealing with binary data. Ensure seamless data conversion and integration into your projects."
	},
	'lorem-ipsum-generator': {
		name: 'Lorem Ipsum Generator',
		icon: 'code',
		link: '/lorem-ipsum-generator',
		description:
		"Effortlessly generate placeholder text with our Lorem Ipsum Generator. Specify the number of characters required, and instantly receive Lorem Ipsum text tailored to your needs. Ideal for designers, developers, and content creators seeking filler text for projects. Enjoy seamless integration into your layouts, ensuring accurate content spacing and visual appeal. Simplify your creative process with our straightforward Lorem Ipsum Generator, allowing you to focus on design without worrying about text content."
	},
	'morsecode-translator':{
        name: 'Morse Code Translator',
        link: '/morsecode-translator',
        description: 
		"Unlock the world of Morse code with our Morse Code Translator. Seamlessly convert your text into Morse code and vice versa, bridging the gap between traditional and digital communication. Input your text, and watch as it transforms into the iconic dots and dashes, or input Morse code and witness it translated back into readable text. Ideal for enthusiasts, learners, and communication hobbyists, our translator simplifies Morse code encoding and decoding tasks. Enjoy the thrill of decoding secret messages or encode your own, all with the ease of a few clicks. Dive into the art of Morse code effortlessly with our Morse Code Translator."
	},
	'number-to-words':{
        name: 'NumToWords',
        link: '/number-to-words',
        description: 
		"NumToWords is your go-to tool for converting numbers into words, especially useful for rendering numerical amounts as text."
	},
	'occurrence-counter': {
		name: 'Occurrence Counter',
		icon: 'code',
		link: '/occurrence-counter',
		description:
		"Analyze your text and effortlessly count the occurrences of specific words or phrases with our Occurrence Counter Tool. Input your text and specify the target word or phrase, and instantly get accurate counts. Ideal for researchers, writers, and analysts tracking word frequencies or conducting content analysis. Enhance your text analysis tasks with this efficient tool, gaining valuable insights from your textual data."
	},
	'palindrome-generator': {
		name: 'Palindrome Generator',
		icon: 'code',
		link: '/palindrome-generator',
		description:
		'Create captivating palindromes effortlessly with our Palindrome Generator. Input your text and watch as it transforms into flawless symmetrical words that read the same backward and forward. Perfect for language enthusiasts, poets, and puzzle lovers. Explore different lengths, styles, and tones to enhance your linguistic creativity. Start crafting mesmerizing palindromes effortlessly and let your words resonate in perfect harmony.'
	},
	'punctuation-remover':{
        name: 'Punctuation Remover',
        link: '/punctuation-remover',
        description: 
		"Simplify your text effortlessly with our Punctuation Remover tool. Say goodbye to commas, periods, quotes, and more, streamlining your content to its purest form. Perfect for data processing, text analysis, or improving readability, our tool swiftly eliminates all punctuation marks, allowing your words to flow seamlessly. Enjoy clean and polished text without the distractions of punctuation, enhancing the clarity of your message. Start refining your content with our Punctuation Remover, ensuring your words shine without any interruptions."
	},
	'random-line-picker':{
        name: 'Random Line Picker',
		icon: 'code',
        link: '/random-line-picker',
        description: 
		"Streamline your text selection process with our Random Line Picker Tool. Input multiple lines of text, and watch as it randomly selects one line for you. Perfect for giveaways, random selections, or creating variety in your content. Empower your decision-making process by adding an element of chance to your text selections."
	},
	'random-string-generator': {
        name: 'Random String Generator',
		icon: 'code',
        link: '/random-string-generator',
        description: 
		"Elevate your data generation tasks with our Random String Generator. Tailor your random strings based on your preferences, specifying maximum and minimum lengths, desired number of strings, and specific patterns. Whether you need diverse passwords, unique identifiers, or customized test data, our tool delivers. Perfect for developers, testers, and data analysts, enabling the creation of random strings for various applications. Craft strings of specific lengths, incorporate patterns, or generate diverse strings in bulk effortlessly. Enhance your data generation experience, ensuring seamless integration into your projects. Start generating tailored random strings with ease, empowering your data-driven endeavors."
	},
	'remove-accents': {
        name: 'Remove Accents',
		icon: 'code',
        link: '/remove-accents',
        description: 
		"Enhance the clarity of your text with our Remove Accent from Text Tool. Input any text containing accented characters, and witness as it effortlessly strips away accents, leaving behind clean and simplified text. Ideal for language enthusiasts, writers, and researchers striving for precise, accent-free communication. Ensure uniformity and readability in your documents, web content, and communications by effortlessly removing diacritical marks. Streamline your text processing tasks, making your content universally understandable. Start removing accents with ease, elevating the professionalism and accessibility of your text."
	},
    'remove-duplicate-text': {
		name: 'Remove Duplicate Text',
		icon: 'code',
		link: '/remove-duplicate-text',
		description:
		"Efficiently clean your text data by eliminating duplicate lines or entries with our Remove Duplicate Text Tool. Input your text, and instantly get a deduplicated version. Ideal for data cleaning, list management, or content organization. Ensure data accuracy and consistency by quickly identifying and removing duplicates from your text."
	},
	'remove-empty-lines':{
        name: 'Remove Empty Lines',
		icon: 'code',
        link: '/remove-empty-lines',
        description: 
		"Optimize your text by eliminating empty lines with our Remove Empty Lines Tool. Input your text, and watch as it seamlessly removes all blank lines, leaving behind a clean and compact version. Ideal for formatting paragraphs, code snippets, or data files. Enhance readability and presentation by effortlessly eliminating unnecessary whitespace."
	},
	'remove-space': {
		name: 'Remove Extra Spaces',
		icon: 'code',
		link: '/remove-space',
		description:
		"Enhance the readability of your text by eliminating extra spaces between words and sentences with our Remove Extra Spaces Tool. Input your text, and watch as it instantly removes redundant spaces, ensuring a clean and professional appearance. Perfect for content editing, code formatting, or data cleaning. Streamline your text presentation with this efficient tool."
	},
	'remove-line-breaks': {
        name: 'Remove Line Breaks',
		icon: 'code',
        link: '/remove-line-breaks',
        description: 
		"Simplify your text formatting with our Remove Line Breaks Tool. Input text containing line breaks, and watch as it seamlessly removes them, creating a continuous flow of text. Ideal for cleaning copied content, formatting paragraphs, or streamlining data. Ensure consistent text presentation by eliminating unexpected line breaks."
    },
	'remove-lines-containing':{
        name: 'Remove Lines Containing',
		icon: 'code',
        link: '/remove-lines-containing',
        description: 
		"Effortlessly filter and clean your text by removing lines containing specific words, phrases, or patterns with our Remove Lines Containing Tool. Input your text and specify the criteria, and watch as it instantly removes matching lines. Perfect for content filtering, data analysis, or decluttering text files. Enhance your text processing tasks by eliminating unwanted content."
	},
	'sorting-tool': {
		name: 'Sorting Tool',
		icon: 'code',
		link: '/sorting-tool',
		description:
		"Streamline your data with our Sorting Tool, offering diverse options for efficient organization. Sort text alphabetically for orderly lists, arrange by length for readability, shuffle randomly for variety, or reverse order for a fresh perspective. Simplify your tasks with precision and flexibility."
	},
	'string-abbreviator':{
        name: 'String Abbreviator',
        link: '/string-abbreviator',
        description: 
		"Condense your lengthy text effortlessly with our String Abbreviator. Input your text, and watch as it transforms into a concise and abbreviated version while retaining essential meaning. Perfect for reducing long sentences, titles, or descriptions into shorter, impactful phrases. Ideal for social media posts, headlines, or summaries, our Abbreviator ensures your message remains clear and engaging, even in limited character spaces. Simplify your text without losing substance, enhancing your communication with precision and brevity. Start abbreviating your strings with ease, ensuring your words pack a powerful punch."
	},
	'string-length-calculator': {
		name: 'String Length Calculator',
		icon: 'code',
		link: '/string-length-calculator',
		description:
		'Discover character counts instantly! Input text into our String Length Calculator to find the total number of characters, including spaces and special characters. Ideal for writers, coders, and anyone tracking character limits. Simplify text management for any length – from short phrases to lengthy paragraphs. Take control of character counts effortlessly. Try our String Length Calculator today!'
	},
	'strip-html-tags': {
        name: 'Strip HTML Tags',
		icon: 'code',
        link: '/strip-html-tags',
        description: 
		"Refine your content effortlessly with our Strip HTML Tags Tool. Input any text containing HTML markup, and watch as it instantly removes all HTML tags, leaving you with clean, readable text. Perfect for writers, editors, and developers dealing with web content, ensuring seamless integration across various platforms. Say goodbye to cluttered code and hello to polished, tag-free content. Streamline your text processing tasks, enhancing readability and user experience. Start stripping HTML tags with ease, transforming your content into its purest, most accessible form."
	},
	'substring-extractor': {
		name: 'Substring Extractor',
		icon: 'code',
		link: '/substring-extractor',
		description:
		"Extract specific substrings or patterns from your text with our Substring Extractor Tool. Input your text and define the target substring or regex pattern, and watch as it efficiently extracts matching content. Ideal for data extraction, text mining, or content analysis. Empower your text processing tasks by retrieving precise information from your textual data."
	},
	'text-analyzer':{
        name: 'Text Analyzer',
		icon: 'code',
        link: '/text-analyzer',
        description: 
		"Explore the depths of your text with our Text Analyzer – a comprehensive tool empowering you to dissect and understand your content thoroughly. Dive into detailed analysis, including character count, word count, sentence count, and paragraph count, offering insights into your text's structure. Identify the most common characters and words, unraveling patterns in your content. Delve into character frequency and word frequency, shedding light on the usage of specific elements. Calculate the average word length for precision in your writing style. Estimate reading time, ensuring your content aligns with your audience's attention span. Elevate your text analysis effortlessly, gaining valuable insights with our Text Analyzer, perfect for writers, editors, and content creators aiming for depth and clarity in their work."
	},
	'text-editor':{
        name: 'Text Editor',
		icon: 'code',
        link: '/text-editor',
        description: 
		"Experience simplicity and functionality with our Text Editor – a user-friendly tool akin to a digital notepad. Input and edit text effortlessly, and choose from options to copy your content, download it as a plain text file, or generate a PDF document. Ideal for quick notes, drafts, or document creation on the go. Enjoy the convenience of basic text editing paired with essential export options, allowing you to save your work instantly or share it seamlessly. Embrace hassle-free text editing and effortless document management with our straightforward Text Editor."
	},
	'text-reversal':{
        name: 'Text Reversal',
		icon: 'code',
        link: '/text-reversal',
        description: 
		"Experience the art of text transformation with our Text Reversal Tool. Effortlessly reverse your text, both word-wise and character-wise, with a simple input. Perfect for writers, language enthusiasts, and puzzle solvers, our tool reverses your sentences, preserving word order while also flipping individual characters. Whether you want to decode encrypted messages, play with linguistic patterns, or add a unique twist to your writing, our tool is your solution. Seamlessly switch between reversing entire sentences or just the characters within each word. Unlock the creative potential of your text, exploring reverse language constructs in both words and characters. Start exploring the world of text reversal with ease, adding depth and creativity to your linguistic endeavors."
	},
	'text-truncator':{
        name: 'Text Truncator',
		icon: 'code',
        link: '/text-truncator',
        description:
		"Refine your text effortlessly with our Text Truncator Tool. Tailor your text to specific lengths, ensuring concise and polished communication. Input your text, set the desired character limit, and watch as it trims down your content while preserving its essence. Ideal for writers, marketers, and social media enthusiasts striving for impactful, concise messaging. Whether you're crafting tweets, headlines, or product descriptions, our tool helps you maintain clarity within space constraints. Simplify lengthy texts without losing their meaning, optimizing readability and engagement. Start truncating text with precision, transforming your content into concise, impactful messages that resonate with your audience." 
	},
	'unicode-encode-decode':{
        name: 'Unicode Encoder & Decoder',
		icon: 'code',
        link: '/unicode-encode-decode',
        description:
		"Explore the vast world of characters with our Unicode Encoder and Decoder Tool. Encode your text into Unicode, representing various languages and symbols with precision. Input your content, and watch as it transforms into a universal digital language, ideal for internationalization and data representation. Conversely, decode Unicode back into readable text effortlessly, bridging linguistic gaps and ensuring seamless communication. Perfect for developers, linguists, and global businesses, our tool simplifies the encoding and decoding of Unicode characters, fostering cross-cultural understanding and smooth digital interactions."
	},
	'upside-down-text': {
		name: 'Upside Down Text Generator',
		icon: 'code',
		link: '/upside-down-text',
		description:
		"Explore the playful side of language with our Upside Down Text Generator. Input your text, and watch as it flips your words and sentences upside down, adding a unique twist to your messages. Ideal for creative writing, social media posts, or playful communication. Engage your audience with this fun and whimsical text transformation tool."
	},
	'url-encode-decode': {
        name: 'URL Encoder & Decoder',
		icon: 'code',
        link: '/url-encode-decode',
        description: 
		"Optimize your web interactions with our URL Encoder and Decoder Tool. Encode sensitive data for secure transmission or decode encoded URLs effortlessly, ensuring seamless communication online. Input your text, and our tool swiftly converts special characters into URL-friendly formats or decodes URLs back to their original state. Ideal for developers, marketers, and anyone managing web content, our tool simplifies the handling of URLs, query strings, and form data. Enhance your website's functionality, ensuring accurate data exchange and smooth user experiences. Start encoding and decoding URLs with ease, streamlining your web interactions and data management tasks."
    },
	'word-counter':{
        name: 'Word Counter',
		icon: 'code',
        link: '/word-counter',
        description: 
		"Analyze your text effortlessly with our Word Counter Tool. Input your text, and instantly get accurate word counts, helping you understand the text's length and complexity. Ideal for writers, students, and researchers monitoring word limits or analyzing textual content. Enhance your writing and editing tasks with this reliable tool, gaining valuable insights into your text."
	},
	// String Utility Tools End
};
