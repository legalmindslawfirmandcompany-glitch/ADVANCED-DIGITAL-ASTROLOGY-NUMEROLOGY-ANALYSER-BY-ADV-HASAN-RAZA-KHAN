document.addEventListener('DOMContentLoaded', () => {

    // --- Global State Variables ---
    let darkMode = true;
    let persons = [
        { name: 'Hasan Raza Khan', month: 'July', day: 29, year: 1990 },
        { name: 'Yasmeen Yasin Sandhu', month: 'April', day: 4, year: 1987 }
    ];
    let numPersons = persons.length;
    let selectedMethods = {
        pythagorean: true,
        chaldean: true,
        cheiro: true,
        kabbalistic: true,
        tamilVedic: true,
        chinese: true,
        islamicAbjad: true,
        astrology: true,
    };
    let analysisResult = null;
    let expanded = {};
    let aiResponse = '';

    // --- DOM Elements ---
    const body = document.body;
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeIcon = document.getElementById('darkModeIcon');
    const methodCheckboxesContainer = document.getElementById('methodCheckboxes');
    const numPersonsInput = document.getElementById('numPersonsInput');
    const personsInputContainer = document.getElementById('personsInputContainer');
    const analyzeButton = document.getElementById('analyzeButton');
    const analyzeButtonText = document.getElementById('analyzeButtonText');
    const analyzeLoader = document.getElementById('analyzeLoader');
    const analysisContainer = document.getElementById('analysisContainer');
    const aiChat = document.getElementById('aiChat');
    const initialPrompt = document.getElementById('initialPrompt');
    const userPromptTextarea = document.getElementById('userPromptTextarea');
    const generateAIResponseButton = document.getElementById('generateAIResponseButton');
    const sendButtonText = document.getElementById('sendButtonText');
    const sendButtonLoader = document.getElementById('sendButtonLoader');
    const apiErrorElement = document.getElementById('apiError');
    const copyModal = document.getElementById('copyModal');

    // --- Numerology and Astrology Mappings and Logic ---
    const MAPPINGS = {
        Pythagorean: {
            'A': 1, 'J': 1, 'S': 1, 'B': 2, 'K': 2, 'T': 2, 'C': 3, 'L': 3, 'U': 3,
            'D': 4, 'M': 4, 'V': 4, 'E': 5, 'N': 5, 'W': 5, 'F': 6, 'O': 6, 'X': 6,
            'G': 7, 'P': 7, 'Y': 7, 'H': 8, 'Q': 8, 'Z': 8, 'I': 9, 'R': 9
        },
        Chaldean: {
            'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 8, 'G': 3, 'H': 5, 'I': 1,
            'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 7, 'P': 8, 'Q': 7, 'R': 2,
            'S': 3, 'T': 4, 'U': 6, 'V': 6, 'W': 6, 'X': 5, 'Y': 1, 'Z': 7
        },
        Cheiro: {
            'A': 1, 'I': 1, 'J': 1, 'Q': 1, 'Y': 1, 'B': 2, 'K': 2, 'R': 2, 'C': 3,
            'G': 3, 'L': 3, 'S': 3, 'D': 4, 'M': 4, 'T': 4, 'E': 5, 'H': 5, 'N': 5,
            'X': 5, 'U': 6, 'V': 6, 'W': 6, 'O': 7, 'Z': 7, 'F': 8, 'P': 8
        },
        Kabbalistic: {
            'A': 1, 'I': 1, 'J': 1, 'Q': 1, 'Y': 1, 'B': 2, 'C': 2, 'K': 2, 'G': 3,
            'L': 3, 'S': 3, 'D': 4, 'M': 4, 'T': 4, 'H': 5, 'N': 5, 'Z': 5, 'E': 8,
            'X': 8, 'O': 7, 'U': 7, 'V': 7, 'W': 7, 'P': 8, 'F': 6, 'R': 6
        },
        IslamicAbjad: {
            'A': 1, 'B': 2, 'J': 3, 'D': 4, 'H': 5, 'W': 6, 'Z': 7, 'Y': 8, 'T': 9,
            'K': 10, 'L': 20, 'M': 30, 'N': 50, 'S': 60, 'E': 70, 'F': 80,
            'Q': 100, 'R': 200, 'Sh': 300, 'Th': 400, 'Kh': 500, 'Dh': 600, 'Gh': 800
        },
    };

    const ASTROLOGY_MAP = {
        'January': { day: 20, sign: 'Aquarius', element: 'Air', luckyColor: 'Blue', luckyDay: 'Saturday', birthstone: 'Garnet', rulingPlanet: 'Uranus' },
        'February': { day: 19, sign: 'Pisces', element: 'Water', luckyColor: 'Sea Green', luckyDay: 'Thursday', birthstone: 'Amethyst', rulingPlanet: 'Neptune' },
        'March': { day: 21, sign: 'Aries', element: 'Fire', luckyColor: 'Red', luckyDay: 'Tuesday', birthstone: 'Aquamarine', rulingPlanet: 'Mars' },
        'April': { day: 20, sign: 'Taurus', element: 'Earth', luckyColor: 'Green', luckyDay: 'Friday', birthstone: 'Diamond', rulingPlanet: 'Venus' },
        'May': { day: 21, sign: 'Gemini', element: 'Air', luckyColor: 'Yellow', luckyDay: 'Wednesday', birthstone: 'Emerald', rulingPlanet: 'Mercury' },
        'June': { day: 21, sign: 'Cancer', element: 'Water', luckyColor: 'White', luckyDay: 'Monday', birthstone: 'Pearl', rulingPlanet: 'Moon' },
        'July': { day: 23, sign: 'Leo', element: 'Fire', luckyColor: 'Gold', luckyDay: 'Sunday', birthstone: 'Peridot', rulingPlanet: 'Sun' },
        'August': { day: 23, sign: 'Virgo', element: 'Earth', luckyColor: 'Silver', luckyDay: 'Wednesday', birthstone: 'Sardonyx', rulingPlanet: 'Mercury' },
        'September': { day: 23, sign: 'Libra', element: 'Air', luckyColor: 'Pink', luckyDay: 'Friday', birthstone: 'Sapphire', rulingPlanet: 'Venus' },
        'October': { day: 23, sign: 'Scorpio', element: 'Water', luckyColor: 'Black', luckyDay: 'Tuesday', birthstone: 'Opal', rulingPlanet: 'Pluto' },
        'November': { day: 22, sign: 'Sagittarius', element: 'Fire', luckyColor: 'Purple', luckyDay: 'Thursday', birthstone: 'Topaz', rulingPlanet: 'Jupiter' },
        'December': { day: 22, sign: 'Capricorn', element: 'Earth', luckyColor: 'Dark Blue', luckyDay: 'Saturday', birthstone: 'Turquoise', rulingPlanet: 'Saturn' },
    };

    const getZodiacSign = (month, day) => {
        const monthDetails = ASTROLOGY_MAP[month];
        if (!monthDetails) return 'Unknown';

        if (day >= monthDetails.day) {
            return monthDetails.sign;
        } else {
            const months = Object.keys(ASTROLOGY_MAP);
            const prevMonthIndex = months.indexOf(month) === 0 ? 11 : months.indexOf(month) - 1;
            return ASTROLOGY_MAP[months[prevMonthIndex]].sign;
        }
    };

    const ZODIAC_COMPATIBILITY = {
        'Aries': { 'Aries': 'High', 'Taurus': 'Low', 'Gemini': 'Medium', 'Cancer': 'Low', 'Leo': 'High', 'Virgo': 'Medium', 'Libra': 'High', 'Scorpio': 'Low', 'Sagittarius': 'High', 'Capricorn': 'Low', 'Aquarius': 'Medium', 'Pisces': 'Medium' },
        'Taurus': { 'Aries': 'Low', 'Taurus': 'High', 'Gemini': 'Medium', 'Cancer': 'High', 'Leo': 'Low', 'Virgo': 'High', 'Libra': 'Medium', 'Scorpio': 'High', 'Sagittarius': 'Medium', 'Capricorn': 'High', 'Aquarius': 'Low', 'Pisces': 'High' },
        'Gemini': { 'Aries': 'Medium', 'Taurus': 'Medium', 'Gemini': 'High', 'Cancer': 'High', 'Leo': 'Medium', 'Virgo': 'Low', 'Libra': 'High', 'Scorpio': 'Medium', 'Sagittarius': 'High', 'Capricorn': 'Low', 'Aquarius': 'High', 'Pisces': 'High' },
        'Cancer': { 'Aries': 'Low', 'Taurus': 'High', 'Gemini': 'High', 'Cancer': 'High', 'Leo': 'Medium', 'Virgo': 'High', 'Libra': 'Medium', 'Scorpio': 'High', 'Sagittarius': 'Low', 'Capricorn': 'High', 'Aquarius': 'Low', 'Pisces': 'High' },
        'Leo': { 'Aries': 'High', 'Taurus': 'Low', 'Gemini': 'Medium', 'Cancer': 'Medium', 'Leo': 'High', 'Virgo': 'Low', 'Libra': 'High', 'Scorpio': 'Low', 'Sagittarius': 'High', 'Capricorn': 'Low', 'Aquarius': 'High', 'Pisces': 'Medium' },
        'Virgo': { 'Aries': 'Medium', 'Taurus': 'High', 'Gemini': 'Low', 'Cancer': 'High', 'Leo': 'Low', 'Virgo': 'High', 'Libra': 'High', 'Scorpio': 'High', 'Sagittarius': 'Medium', 'Capricorn': 'High', 'Aquarius': 'Low', 'Pisces': 'High' },
        'Libra': { 'Aries': 'High', 'Taurus': 'Medium', 'Gemini': 'High', 'Cancer': 'Medium', 'Leo': 'High', 'Virgo': 'High', 'Libra': 'High', 'Scorpio': 'Low', 'Sagittarius': 'High', 'Capricorn': 'Medium', 'Aquarius': 'High', 'Pisces': 'Medium' },
        'Scorpio': { 'Aries': 'Low', 'Taurus': 'High', 'Gemini': 'Medium', 'Cancer': 'High', 'Leo': 'Low', 'Virgo': 'High', 'Libra': 'Low', 'Scorpio': 'High', 'Sagittarius': 'Low', 'Capricorn': 'High', 'Aquarius': 'Low', 'Pisces': 'High' },
        'Sagittarius': { 'Aries': 'High', 'Taurus': 'Medium', 'Gemini': 'High', 'Cancer': 'Low', 'Leo': 'High', 'Virgo': 'Medium', 'Libra': 'High', 'Scorpio': 'Low', 'Sagittarius': 'High', 'Capricorn': 'Low', 'Aquarius': 'High', 'Pisces': 'High' },
        'Capricorn': { 'Aries': 'Low', 'Taurus': 'High', 'Gemini': 'Low', 'Cancer': 'High', 'Leo': 'Low', 'Virgo': 'High', 'Libra': 'Medium', 'Scorpio': 'High', 'Sagittarius': 'Low', 'Aquarius': 'Medium', 'Pisces': 'Medium' },
        'Aquarius': { 'Aries': 'Medium', 'Taurus': 'Low', 'Gemini': 'High', 'Cancer': 'Low', 'Leo': 'High', 'Virgo': 'Low', 'Libra': 'High', 'Scorpio': 'Low', 'Sagittarius': 'High', 'Capricorn': 'Medium', 'Aquarius': 'High', 'Pisces': 'Medium' },
        'Pisces': { 'Aries': 'Medium', 'Taurus': 'High', 'Gemini': 'High', 'Cancer': 'High', 'Leo': 'Medium', 'Virgo': 'High', 'Libra': 'Medium', 'Scorpio': 'High', 'Sagittarius': 'High', 'Capricorn': 'Medium', 'Aquarius': 'Medium', 'Pisces': 'High' },
    };

    const getElementCompatibility = (element1, element2) => {
        if (element1 === element2) return 'Excellent';
        if ((element1 === 'Fire' && element2 === 'Air') || (element1 === 'Air' && element2 === 'Fire')) return 'Good';
        if ((element1 === 'Earth' && element2 === 'Water') || (element1 === 'Water' && element2 === 'Earth')) return 'Good';
        if ((element1 === 'Fire' && element2 === 'Earth') || (element1 === 'Earth' && element2 === 'Fire')) return 'Fair';
        if ((element1 === 'Air' && element2 === 'Water') || (element1 === 'Water' && element2 === 'Air')) return 'Fair';
        return 'Challenging';
    };

    const reduceToSingleDigit = (num) => {
        if (isNaN(num)) return NaN;
        let sum = String(num).split('').map(Number).reduce((a, b) => a + b, 0);
        while (sum > 9 && ![11, 22, 33].includes(sum)) {
            sum = String(sum).split('').map(Number).reduce((a, b) => a + b, 0);
        }
        return sum;
    };

    const calculateNameNumber = (name, system) => {
        if (!MAPPINGS[system]) return null;
        let sum = 0;
        const mapping = MAPPINGS[system];
        const parts = name.toUpperCase().split(' ');
        const partSums = parts.map(part => {
            let partSum = 0;
            for (const char of part) {
                if (mapping[char]) {
                    partSum += mapping[char];
                }
            }
            return reduceToSingleDigit(partSum);
        });
        sum = partSums.reduce((a, b) => a + b, 0);
        return { total: reduceToSingleDigit(sum), partSums };
    };

    const calculateLifePath = (person) => {
        const { month, day, year } = person;
        if (isNaN(day) || isNaN(year)) return NaN;
        const monthIndex = new Date(Date.parse(month + ' 1, 2000')).getMonth() + 1;
        const monthNum = reduceToSingleDigit(monthIndex);
        const dayNum = reduceToSingleDigit(day);
        const yearNum = reduceToSingleDigit(year);
        const total = monthNum + dayNum + yearNum;
        return reduceToSingleDigit(total);
    };

    const getTamilVedicNumbers = (person) => {
        if (isNaN(person.day) || isNaN(person.year)) return { driver: NaN, connector: NaN, kethu: NaN };
        const driver = reduceToSingleDigit(person.day);
        const monthIndex = new Date(Date.parse(person.month + ' 1, 2000')).getMonth() + 1;
        const connector = reduceToSingleDigit(reduceToSingleDigit(person.day) + reduceToSingleDigit(monthIndex) + reduceToSingleDigit(person.year));
        const kethu = reduceToSingleDigit(monthIndex);
        return { driver, connector, kethu };
    };

    const getMissingAndPresentNumbers = (person) => {
        if (isNaN(person.day) || isNaN(person.year)) return { presentNumbers: [], missingNumbers: [] };
        const numbers = new Set();
        const fullDate = `${new Date(Date.parse(person.month + ' 1, 2000')).getMonth() + 1}${person.day}${person.year}`;
        for (const char of fullDate) {
            if (char !== '0') numbers.add(parseInt(char));
        }
        for (const char of person.name.toUpperCase()) {
            if (char.match(/[A-Z]/) && MAPPINGS.Pythagorean[char]) {
                const num = MAPPINGS.Pythagorean[char];
                if (num !== 0) numbers.add(num);
            }
        }
        const presentNumbers = Array.from(numbers).sort((a, b) => a - b);
        const missingNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => !presentNumbers.includes(n));
        return { presentNumbers, missingNumbers };
    };

    const getSuccessLines = (presentNumbers) => {
        const successLines = [];
        const mind = presentNumbers.includes(3) && presentNumbers.includes(6) && presentNumbers.includes(9);
        const practical = presentNumbers.includes(4) && presentNumbers.includes(5) && presentNumbers.includes(6);
        const emotional = presentNumbers.includes(1) && presentNumbers.includes(2) && presentNumbers.includes(3);
        if (mind) successLines.push('Mind Plane');
        if (practical) successLines.push('Practical Plane');
        if (emotional) successLines.push('Emotional Plane');
        return successLines;
    };

    const getChineseZodiac = (year) => {
        if (isNaN(year)) return 'N/A';
        const zodiacs = ['Monkey', 'Rooster', 'Dog', 'Pig', 'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat'];
        const elements = ['Metal', 'Water', 'Wood', 'Fire', 'Earth'];
        const elementStartYear = 1984; // Start year for Wood Rat
        const zodiacIndex = (year - 4) % 12;
        const elementIndex = (Math.floor((year - elementStartYear) / 2)) % 5;
        return `${elements[elementIndex]} ${zodiacs[zodiacIndex]}`;
    };

    // --- UI Rendering Functions ---
    const renderCheckboxes = () => {
        methodCheckboxesContainer.innerHTML = '';
        Object.keys(selectedMethods).forEach(method => {
            const label = document.createElement('label');
            label.className = 'flex items-center space-x-2';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = selectedMethods[method];
            checkbox.className = 'form-checkbox h-5 w-5 text-purple-600 rounded-md border-gray-300 dark:border-gray-600 focus:ring-purple-500 dark:bg-gray-700';
            checkbox.addEventListener('change', () => handleCheckboxChange(method));
            const span = document.createElement('span');
            span.className = 'text-gray-800 dark:text-gray-200';
            span.textContent = method.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            label.appendChild(checkbox);
            label.appendChild(span);
            methodCheckboxesContainer.appendChild(label);
        });
    };

    const renderPersonsInput = () => {
        personsInputContainer.innerHTML = '';
        persons.forEach((person, index) => {
            const personDiv = document.createElement('div');
            personDiv.className = 'space-y-4 mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg';
            personDiv.innerHTML = `
                <h3 class="text-lg font-semibold text-purple-600 dark:text-purple-400">Person ${index + 1}</h3>
                <div>
                    <label class="block text-sm font-medium mb-1">Name</label>
                    <input
                        type="text"
                        value="${person.name}"
                        data-index="${index}"
                        data-key="name"
                        class="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Full Name"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Date of Birth</label>
                    <div class="flex space-x-2">
                        <select
                            data-index="${index}"
                            data-key="month"
                            class="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            ${Object.keys(ASTROLOGY_MAP).map(month => `<option value="${month}" ${person.month === month ? 'selected' : ''}>${month}</option>`).join('')}
                        </select>
                        <input
                            type="number"
                            min="1" max="31"
                            value="${person.day}"
                            data-index="${index}"
                            data-key="day"
                            class="w-1/3 p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="Day"
                        />
                        <input
                            type="number"
                            min="1900" max="2100"
                            value="${person.year}"
                            data-index="${index}"
                            data-key="year"
                            class="w-1/3 p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="Year"
                        />
                    </div>
                </div>
            `;
            personsInputContainer.appendChild(personDiv);
        });
        
        personsInputContainer.querySelectorAll('input, select').forEach(element => {
            element.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                const key = e.target.dataset.key;
                const value = e.target.value;
                handlePersonChange(index, key, value);
            });
        });
    };

    const renderAnalysis = (results) => {
        aiChat.innerHTML = ''; // Clear previous content
        initialPrompt.style.display = 'none';

        if (results.length > 1) {
            const jointAnalysis = createJointAnalysis(results[0], results[1]);
            aiChat.appendChild(jointAnalysis);
        }

        results.forEach((person, index) => {
            const personAnalysis = createPersonAnalysis(person, index);
            aiChat.appendChild(personAnalysis);
        });

        const aiResponseDiv = document.createElement('div');
        aiResponseDiv.className = 'bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-inner analysis-output';
        aiResponseDiv.innerHTML = `
            <h3 class="text-xl font-bold mb-2 flex items-center text-purple-600 dark:text-purple-400">
                <span data-lucide="bot" class="h-5 w-5 mr-2"></span> AI Response
            </h3>
            <p id="aiResponseText">${aiResponse || 'Enter a prompt below to get an AI analysis.'}</p>
        `;
        aiChat.appendChild(aiResponseDiv);
        lucide.createIcons();
    };

    const createPersonAnalysis = (person, index) => {
        const { zodiacSign, astrology, tamilVedic, lifePath, pythagoreanName, chaldeanName, abjadName, presentNumbers, missingNumbers, successLines, chineseZodiac } = person;
        const driverNumber = reduceToSingleDigit(person.day);
        const key = `person-${index}`;
        
        const personDiv = document.createElement('div');
        personDiv.className = 'bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4';
        personDiv.innerHTML = `
            <button class="w-full text-left p-2 flex items-center justify-between text-lg font-semibold text-purple-600 dark:text-purple-400">
                <span>Person ${index + 1} Analysis: ${person.name || `Person ${index + 1}`}</span>
                <span class="expand-icon" data-lucide="chevron-down"></span>
            </button>
            <div class="analysis-content hidden mt-4 text-gray-800 dark:text-gray-200 space-y-4">
                <div>
                    <h4 class="font-bold text-md flex items-center mb-2"><span data-lucide="hand" class="h-4 w-4 mr-2 text-purple-500"></span> Numerological Foundations</h4>
                    <ul class="list-disc list-inside space-y-1">
                        ${selectedMethods.pythagorean ? `<li>Pythagorean Expression Number: <span class="font-semibold">${pythagoreanName?.total || 'N/A'}</span></li>` : ''}
                        ${selectedMethods.chaldean ? `<li>Chaldean Name Vibration: <span class="font-semibold">${chaldeanName?.total || 'N/A'}</span></li>` : ''}
                        ${selectedMethods.islamicAbjad ? `<li>Islamic (Abjad) Name Vibration: <span class="font-semibold">${abjadName?.total || 'N/A'}</span></li>` : ''}
                        ${selectedMethods.tamilVedic ? `<li>Tamil/Vedic Numerology: Driver: <span class="font-semibold">${tamilVedic?.driver || 'N/A'}</span>, Connector: <span class="font-semibold">${tamilVedic?.connector || 'N/A'}</span>, Kethu: <span class="font-semibold">${tamilVedic?.kethu || 'N/A'}</span></li>` : ''}
                        <li>Driver Number (Birth Number): <span class="font-semibold">${!isNaN(driverNumber) ? driverNumber : 'N/A'}</span></li>
                        <li>Connector Number (Life Path): <span class="font-semibold">${!isNaN(lifePath) ? lifePath : 'N/A'}</span></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold text-md flex items-center mb-2"><span data-lucide="gem" class="h-4 w-4 mr-2 text-purple-500"></span> Planetary & Astrological Influences</h4>
                    <ul class="list-disc list-inside space-y-1">
                        ${selectedMethods.astrology ? `<li>Zodiac Sign: <span class="font-semibold">${zodiacSign || 'N/A'}</span></li>` : ''}
                        ${selectedMethods.astrology ? `<li>Element: <span class="font-semibold">${astrology?.element || 'N/A'}</span></li>` : ''}
                        ${selectedMethods.astrology ? `<li>Ruling Planet: <span class="font-semibold">${astrology?.rulingPlanet || 'N/A'}</span></li>` : ''}
                        ${selectedMethods.chinese ? `<li>Chinese Zodiac: <span class="font-semibold">${chineseZodiac || 'N/A'}</span></li>` : ''}
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold text-md flex items-center mb-2"><span data-lucide="link-icon" class="h-4 w-4 mr-2 text-purple-500"></span> Lo Shu Grid & Success Lines</h4>
                    <ul class="list-disc list-inside space-y-1">
                        <li>Present Numbers: <span class="font-semibold">${presentNumbers?.join(', ') || 'None'}</span></li>
                        <li>Missing Numbers: <span class="font-semibold">${missingNumbers?.join(', ') || 'None'}</span></li>
                        <li>Success Lines: <span class="font-semibold">${successLines?.length > 0 ? successLines.join(', ') : 'None'}</span></li>
                    </ul>
                </div>
            </div>
        `;
        personDiv.querySelector('button').addEventListener('click', () => toggleExpand(key));
        personDiv.dataset.key = key;
        return personDiv;
    };

    const createJointAnalysis = (person1, person2) => {
        const key = 'joint-analysis';
        const zodiacSign1 = getZodiacSign(person1.month, person1.day);
        const zodiacSign2 = getZodiacSign(person2.month, person2.day);
        const astrology1 = ASTROLOGY_MAP[person1.month];
        const astrology2 = ASTROLOGY_MAP[person2.month];
        const compatibility = ZODIAC_COMPATIBILITY[zodiacSign1]?.[zodiacSign2] || 'N/A';
        const elementCompatibility = getElementCompatibility(astrology1?.element, astrology2?.element);
        
        const jointDiv = document.createElement('div');
        jointDiv.className = 'bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md';
        jointDiv.innerHTML = `
            <button class="w-full text-left p-2 flex items-center justify-between text-lg font-semibold text-purple-600 dark:text-purple-400">
                <span>Joint Analysis and Compatibility</span>
                <span class="expand-icon" data-lucide="chevron-down"></span>
            </button>
            <div class="analysis-content hidden mt-4 text-gray-800 dark:text-gray-200 space-y-4">
                <h4 class="font-bold text-md flex items-center mb-2"><span data-lucide="handshake" class="h-4 w-4 mr-2 text-purple-500"></span> Compatibility Overview</h4>
                <ul class="list-disc list-inside space-y-1">
                    <li>Numerological Compatibility: Drivers <span class="font-semibold">${!isNaN(reduceToSingleDigit(person1.day)) ? reduceToSingleDigit(person1.day) : 'N/A'}</span> and <span class="font-semibold">${!isNaN(reduceToSingleDigit(person2.day)) ? reduceToSingleDigit(person2.day) : 'N/A'}</span>. Life Paths <span class="font-semibold">${person1.lifePath}</span> and <span class="font-semibold">${person2.lifePath}</span>.</li>
                    <li>Astrological Compatibility: Zodiac Signs <span class="font-semibold">${zodiacSign1}</span> (<span class="font-semibold">${astrology1?.element || 'N/A'}</span>) and <span class="font-semibold">${zodiacSign2}</span> (<span class="font-semibold">${astrology2?.element || 'N/A'}</span>). Overall Compatibility: <span class="font-semibold">${compatibility}</span>.</li>
                    <li>Element Compatibility: <span class="font-semibold">${elementCompatibility}</span></li>
                </ul>
            </div>
        `;
        jointDiv.querySelector('button').addEventListener('click', () => toggleExpand(key));
        jointDiv.dataset.key = key;
        return jointDiv;
    };

    // --- State and UI Handlers ---
    const handlePersonChange = (index, key, value) => {
        persons[index][key] = (key === 'day' || key === 'year') ? (value === '' ? '' : parseInt(value)) : value;
    };

    const handleCheckboxChange = (method) => {
        selectedMethods[method] = !selectedMethods[method];
        renderCheckboxes(); // Re-render to reflect state change
    };

    const handleAnalyze = () => {
        analyzeButtonText.textContent = 'Analyzing...';
        analyzeButton.disabled = true;
        analyzeLoader.classList.remove('hidden');

        setTimeout(() => {
            const results = persons.map(person => {
                const lifePath = calculateLifePath(person);
                const pythagoreanName = calculateNameNumber(person.name, 'Pythagorean');
                const chaldeanName = calculateNameNumber(person.name, 'Chaldean');
                const abjadName = calculateNameNumber(person.name, 'IslamicAbjad');
                const astrology = ASTROLOGY_MAP[person.month];
                const zodiacSign = getZodiacSign(person.month, person.day);
                const { presentNumbers, missingNumbers } = getMissingAndPresentNumbers(person);
                const successLines = getSuccessLines(presentNumbers);
                const tamilVedic = getTamilVedicNumbers(person);
                const chineseZodiac = getChineseZodiac(person.year);
                return {
                    ...person,
                    lifePath,
                    pythagoreanName,
                    chaldeanName,
                    abjadName,
                    astrology,
                    zodiacSign,
                    presentNumbers,
                    missingNumbers,
                    successLines,
                    tamilVedic,
                    chineseZodiac
                };
            });
            analysisResult = results;
            renderAnalysis(results);
            analyzeButtonText.textContent = 'Run Analysis';
            analyzeButton.disabled = false;
            analyzeLoader.classList.add('hidden');
        }, 1000); // Simulate a loading delay
    };

    const toggleDarkMode = () => {
        darkMode = !darkMode;
        body.classList.toggle('bg-gray-900', darkMode);
        body.classList.toggle('text-gray-100', darkMode);
        body.classList.toggle('bg-gray-50', !darkMode);
        body.classList.toggle('text-gray-900', !darkMode);
        darkModeIcon.dataset.lucide = darkMode ? 'sun' : 'moon';
        lucide.createIcons(); // Re-render the icon
    };

    const handlePersonCountChange = (e) => {
        const newNum = Math.min(5, Math.max(1, parseInt(e.target.value) || 1));
        numPersons = newNum;
        while (persons.length < newNum) {
            persons.push({ name: '', month: 'January', day: 1, year: 2000 });
        }
        persons = persons.slice(0, newNum);
        renderPersonsInput();
    };

    const toggleExpand = (key) => {
        expanded[key] = !expanded[key];
        const element = document.querySelector(`[data-key="${key}"] .analysis-content`);
        const icon = document.querySelector(`[data-key="${key}"] .expand-icon`);
        if (element && icon) {
            element.classList.toggle('hidden', !expanded[key]);
            icon.dataset.lucide = expanded[key] ? 'chevron-up' : 'chevron-down';
            lucide.createIcons(); // Re-render the icon
        }
    };

    // --- API Handlers ---
    const formatAnalysisForAI = (results, selectedMethods) => {
        if (!results || results.length === 0) return "No analysis results to provide.";

        let formattedText = "Here are the numerology and astrology results for the entered persons based on the provided data and selected methodologies:\n\n";

        // User Data Section
        formattedText += "## 1. User Data\n";
        results.forEach((person, index) => {
            formattedText += `\n### Person ${index + 1}: ${person.name || 'Unnamed'}\n`;
            formattedText += `- Name: ${person.name || 'N/A'}\n`;
            formattedText += `- Date of Birth: ${person.month} ${person.day}, ${person.year}\n`;
        });

        // App Results Section
        formattedText += "\n## 2. App-Generated Results\n";
        if (results.length > 1) {
            formattedText += "\n### Joint Analysis\n";
            const p1 = results[0];
            const p2 = results[1];
            const zodiacSign1 = getZodiacSign(p1.month, p1.day);
            const zodiacSign2 = getZodiacSign(p2.month, p2.day);
            const astrology1 = ASTROLOGY_MAP[p1.month];
            const astrology2 = ASTROLOGY_MAP[p2.month];
            const compatibility = ZODIAC_COMPATIBILITY[zodiacSign1]?.[zodiacSign2] || 'N/A';
            const elementCompatibility = getElementCompatibility(astrology1?.element, astrology2?.element);

            formattedText += `- Zodiac Compatibility: ${compatibility}\n`;
            formattedText += `- Element Compatibility: ${elementCompatibility}\n`;
        }

        results.forEach((person, index) => {
            formattedText += `\n### Analysis for ${person.name || `Person ${index + 1}`}\n`;
            formattedText += `Life Path Number: ${!isNaN(person.lifePath) ? person.lifePath : 'N/A'}\n`;
            if (selectedMethods.pythagorean) formattedText += `Pythagorean Name Number: ${person.pythagoreanName?.total || 'N/A'}\n`;
            if (selectedMethods.chaldean) formattedText += `Chaldean Name Number: ${person.chaldeanName?.total || 'N/A'}\n`;
            if (selectedMethods.islamicAbjad) formattedText += `Islamic (Abjad) Name Number: ${person.abjadName?.total || 'N/A'}\n`;
            if (selectedMethods.astrology) formattedText += `Zodiac Sign: ${person.zodiacSign || 'N/A'}\n`;
            if (selectedMethods.chinese) formattedText += `Chinese Zodiac: ${person.chineseZodiac || 'N/A'}\n`;
        });
        
        return formattedText;
    };

    const handleGenerateAIResponse = async () => {
        if (!analysisResult) {
            apiErrorElement.textContent = "Please run an analysis first to get results for the AI.";
            apiErrorElement.classList.remove('hidden');
            return;
        }
        
        sendButtonText.textContent = '';
        sendButtonLoader.classList.remove('hidden');
        generateAIResponseButton.disabled = true;
        apiErrorElement.classList.add('hidden');

        try {
            const analysisText = formatAnalysisForAI(analysisResult, selectedMethods);
            const fullPrompt = `Based on the following data and requested analysis, please provide a deep, comprehensive, and well-structured analysis.
            
**Instructions:**
1.  Use the provided numerology and astrology data as the basis for your analysis.
2.  Provide your response in a well-structured format with clear headings.
3.  Include a section for "User Data" showing the names and dates of birth.
4.  Then, provide the main "AI Analysis" with sub-sections for each methodology.
5.  In the "Methodologies and Calculations" section, explain the core principles of each selected system (e.g., Pythagorean, Chaldean, etc.) and show the step-by-step calculations.
6.  Finally, provide a detailed "Joint Analysis" section (if applicable) that covers advantages, disadvantages, matchings, and how the two individuals complement each other.

**Provided Data:**
${analysisText}

**User Question:**
${userPromptTextarea.value}
            `;
            
            const chatHistory = [{ role: "user", parts: [{ text: fullPrompt }] }];
            const payload = { contents: chatHistory };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message || `API error: ${response.status}`);
            }

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                aiResponse = result.candidates[0].content.parts[0].text;
                document.getElementById('aiResponseText').textContent = aiResponse;
            } else {
                aiResponse = "Sorry, I couldn't generate a response. Please try again.";
                document.getElementById('aiResponseText').textContent = aiResponse;
            }
        } catch (error) {
            apiErrorElement.textContent = `Failed to fetch AI response: ${error.message}`;
            apiErrorElement.classList.remove('hidden');
            console.error('API Error:', error);
        } finally {
            sendButtonText.textContent = 'Send';
            sendButtonLoader.classList.add('hidden');
            generateAIResponseButton.disabled = false;
        }
    };

    // --- Event Listeners ---
    darkModeToggle.addEventListener('click', toggleDarkMode);
    numPersonsInput.addEventListener('change', handlePersonCountChange);
    analyzeButton.addEventListener('click', handleAnalyze);
    generateAIResponseButton.addEventListener('click', handleGenerateAIResponse);
    userPromptTextarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGenerateAIResponse();
        }
    });

    // Initial render
    renderCheckboxes();
    renderPersonsInput();
});
