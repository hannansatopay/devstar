<script>
    let timezoneCount = 0;
    let currentDateTime = new Date().toLocaleString('sv');
    currentDateTime = currentDateTime.substring(0, currentDateTime.length - 3);
    /**
	 * @type {any[]}
	 */
    let selectedTimezones = [];
    /**
	 * @type {string | any[]}
	 */
    let convertedTimes = [];
  
    function addTimezone() {
      if (timezoneCount < 6) {
        selectedTimezones = [...selectedTimezones, ''];
        timezoneCount++;
      }
    }
  
    let sortedTimezones = [
    "UTC",
    "Africa/Abidjan",
  "Africa/Accra",
  "Africa/Addis_Ababa",
  "Africa/Algiers",
  "Africa/Asmara",
  "Africa/Asmera",
  "Africa/Bamako",
  "Africa/Bangui",
  "Africa/Banjul",
  "Africa/Bissau",
  "Africa/Blantyre",
  "Africa/Brazzaville",
  "Africa/Bujumbura",
  "Africa/Cairo",
  "Africa/Casablanca",
  "Africa/Ceuta",
  "Africa/Conakry",
  "Africa/Dakar",
  "Africa/Dar_es_Salaam",
  "Africa/Djibouti",
  "Africa/Douala",
  "Africa/El_Aaiun",
  "Africa/Freetown",
  "Africa/Gaborone",
  "Africa/Harare",
  "Africa/Johannesburg",
  "Africa/Juba",
  "Africa/Kampala",
  "Africa/Khartoum",
  "Africa/Kigali",
  "Africa/Kinshasa",
  "Africa/Lagos",
  "Africa/Libreville",
  "Africa/Lome",
  "Africa/Luanda",
  "Africa/Lubumbashi",
  "Africa/Lusaka",
  "Africa/Malabo",
  "Africa/Maputo",
  "Africa/Maseru",
  "Africa/Mbabane",
  "Africa/Mogadishu",
  "Africa/Monrovia",
  "Africa/Nairobi",
  "Africa/Ndjamena",
  "Africa/Niamey",
  "Africa/Nouakchott",
  "Africa/Ouagadougou",
  "Africa/Porto-Novo",
  "Africa/Sao_Tome",
  "Africa/Timbuktu",
  "Africa/Tripoli",
  "Africa/Tunis",
  "Africa/Windhoek",
  "America/Adak",
  "America/Anchorage",
  "America/Anguilla",
  "America/Antigua",
  "America/Araguaina",
  "America/Argentina/Buenos_Aires",
  "America/Argentina/Catamarca",
  "America/Argentina/ComodRivadavia",
  "America/Argentina/Cordoba",
  "America/Argentina/Jujuy",
  "America/Argentina/La_Rioja",
  "America/Argentina/Mendoza",
  "America/Argentina/Rio_Gallegos",
  "America/Argentina/Salta",
  "America/Argentina/San_Juan",
  "America/Argentina/San_Luis",
  "America/Argentina/Tucuman",
  "America/Argentina/Ushuaia",
  "America/Aruba",
  "America/Asuncion",
  "America/Atikokan",
  "America/Atka",
  "America/Bahia",
  "America/Bahia_Banderas",
  "America/Barbados",
  "America/Belem",
  "America/Belize",
  "America/Blanc-Sablon",
  "America/Boa_Vista",
  "America/Bogota",
  "America/Boise",
  "America/Buenos_Aires",
  "America/Cambridge_Bay",
  "America/Campo_Grande",
  "America/Cancun",
  "America/Caracas",
  "America/Catamarca",
  "America/Cayenne",
  "America/Cayman",
  "America/Chicago",
  "America/Chihuahua",
  "America/Coral_Harbour",
  "America/Cordoba",
  "America/Costa_Rica",
  "America/Creston",
  "America/Cuiaba",
  "America/Curacao",
  "America/Danmarkshavn",
  "America/Dawson",
  "America/Dawson_Creek",
  "America/Denver",
  "America/Detroit",
  "America/Dominica",
  "America/Edmonton",
  "America/Eirunepe",
  "America/El_Salvador",
  "America/Ensenada",
  "America/Fort_Nelson",
  "America/Fort_Wayne",
  "America/Fortaleza",
  "America/Glace_Bay",
  "America/Godthab",
  "America/Goose_Bay",
  "America/Grand_Turk",
  "America/Grenada",
  "America/Guadeloupe",
  "America/Guatemala",
  "America/Guayaquil",
  "America/Guyana",
  "America/Halifax",
  "America/Havana",
  "America/Hermosillo",
  "America/Indiana/Indianapolis",
  "America/Indiana/Knox",
  "America/Indiana/Marengo",
  "America/Indiana/Petersburg",
  "America/Indiana/Tell_City",
  "America/Indiana/Vevay",
  "America/Indiana/Vincennes",
  "America/Indiana/Winamac",
  "America/Indianapolis",
  "America/Inuvik",
  "America/Iqaluit",
  "America/Jamaica",
  "America/Jujuy",
  "America/Juneau",
  "America/Kentucky/Louisville",
  "America/Kentucky/Monticello",
  "America/Knox_IN",
  "America/Kralendijk",
  "America/La_Paz",
  "America/Lima",
  "America/Los_Angeles",
  "America/Louisville",
  "America/Lower_Princes",
  "America/Maceio",
  "America/Managua",
  "America/Manaus",
  "America/Marigot",
  "America/Martinique",
  "America/Matamoros",
  "America/Mazatlan",
  "America/Mendoza",
  "America/Menominee",
  "America/Merida",
  "America/Metlakatla",
  "America/Mexico_City",
  "America/Miquelon",
  "America/Moncton",
  "America/Monterrey",
  "America/Montevideo",
  "America/Montreal",
  "America/Montserrat",
  "America/Nassau",
  "America/New_York",
  "America/Nipigon",
  "America/Nome",
  "America/Noronha",
  "America/North_Dakota/Beulah",
  "America/North_Dakota/Center",
  "America/North_Dakota/New_Salem",
  "America/Ojinaga",
  "America/Panama",
  "America/Pangnirtung",
  "America/Paramaribo",
  "America/Phoenix",
  "America/Port_of_Spain",
  "America/Port-au-Prince",
  "America/Porto_Acre",
  "America/Porto_Velho",
  "America/Puerto_Rico",
  "America/Punta_Arenas",
  "America/Rainy_River",
  "America/Rankin_Inlet",
  "America/Recife",
  "America/Regina",
  "America/Resolute",
  "America/Rio_Branco",
  "America/Rosario",
  "America/Santa_Isabel",
  "America/Santarem",
  "America/Santiago",
  "America/Santo_Domingo",
  "America/Sao_Paulo",
  "America/Scoresbysund",
  "America/Shiprock",
  "America/Sitka",
  "America/St_Barthelemy",
  "America/St_Johns",
  "America/St_Kitts",
  "America/St_Lucia",
  "America/St_Thomas",
  "America/St_Vincent",
  "America/Swift_Current",
  "America/Tegucigalpa",
  "America/Thule",
  "America/Thunder_Bay",
  "America/Tijuana",
  "America/Toronto",
  "America/Tortola",
  "America/Vancouver",
  "America/Virgin",
  "America/Whitehorse",
  "America/Winnipeg",
  "America/Yakutat",
  "America/Yellowknife",
  "Antarctica/Casey",
  "Antarctica/Davis",
  "Antarctica/DumontDUrville",
  "Antarctica/Macquarie",
  "Antarctica/Mawson",
  "Antarctica/McMurdo",
  "Antarctica/Palmer",
  "Antarctica/Rothera",
  "Antarctica/South_Pole",
  "Antarctica/Syowa",
  "Antarctica/Troll",
  "Antarctica/Vostok",
  "Arctic/Longyearbyen",
  "Asia/Aden",
  "Asia/Almaty",
  "Asia/Amman",
  "Asia/Anadyr",
  "Asia/Aqtau",
  "Asia/Aqtobe",
  "Asia/Ashgabat",
  "Asia/Ashkhabad",
  "Asia/Atyrau",
  "Asia/Baghdad",
  "Asia/Bahrain",
  "Asia/Baku",
  "Asia/Bangkok",
  "Asia/Barnaul",
  "Asia/Beirut",
  "Asia/Bishkek",
  "Asia/Brunei",
  "Asia/Chita",
  "Asia/Choibalsan",
  "Asia/Chongqing",
  "Asia/Chungking",
  "Asia/Colombo",
  "Asia/Dacca",
  "Asia/Damascus",
  "Asia/Dhaka",
  "Asia/Dili",
  "Asia/Dubai",
  "Asia/Dushanbe",
  "Asia/Famagusta",
  "Asia/Gaza",
  "Asia/Harbin",
  "Asia/Hebron",
  "Asia/Ho_Chi_Minh",
  "Asia/Hong_Kong",
  "Asia/Hovd",
  "Asia/Irkutsk",
  "Asia/Istanbul",
  "Asia/Jakarta",
  "Asia/Jayapura",
  "Asia/Jerusalem",
  "Asia/Kabul",
  "Asia/Kamchatka",
  "Asia/Karachi",
  "Asia/Kashgar",
  "Asia/Kathmandu",
  "Asia/Katmandu",
  "Asia/Khandyga",
  "Asia/Kolkata",
  "Asia/Krasnoyarsk",
  "Asia/Kuala_Lumpur",
  "Asia/Kuching",
  "Asia/Kuwait",
  "Asia/Macao",
  "Asia/Macau",
  "Asia/Magadan",
  "Asia/Makassar",
  "Asia/Manila",
  "Asia/Muscat",
  "Asia/Nicosia",
  "Asia/Novokuznetsk",
  "Asia/Novosibirsk",
  "Asia/Omsk",
  "Asia/Oral",
  "Asia/Phnom_Penh",
  "Asia/Pontianak",
  "Asia/Pyongyang",
  "Asia/Qatar",
  "Asia/Qostanay",
  "Asia/Qyzylorda",
  "Asia/Rangoon",
  "Asia/Riyadh",
  "Asia/Saigon",
  "Asia/Sakhalin",
  "Asia/Samarkand",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Srednekolymsk",
  "Asia/Taipei",
  "Asia/Tashkent",
  "Asia/Tbilisi",
  "Asia/Tehran",
  "Asia/Tel_Aviv",
  "Asia/Thimbu",
  "Asia/Thimphu",
  "Asia/Tokyo",
  "Asia/Tomsk",
  "Asia/Ujung_Pandang",
  "Asia/Ulaanbaatar",
  "Asia/Ulan_Bator",
  "Asia/Urumqi",
  "Asia/Ust-Nera",
  "Asia/Vientiane",
  "Asia/Vladivostok",
  "Asia/Yakutsk",
  "Asia/Yangon",
  "Asia/Yekaterinburg",
  "Asia/Yerevan",
  "Atlantic/Azores",
  "Atlantic/Bermuda",
  "Atlantic/Canary",
  "Atlantic/Cape_Verde",
  "Atlantic/Faeroe",
  "Atlantic/Faroe",
  "Atlantic/Jan_Mayen", 
  "Atlantic/Madeira",
"Atlantic/Reykjavik",
"Atlantic/South_Georgia",
"Atlantic/St_Helena",
"Atlantic/Stanley",
"Australia/Adelaide",
"Australia/Brisbane",
"Australia/Broken_Hill",
"Australia/Currie",
"Australia/Darwin",
"Australia/Eucla",
"Australia/Hobart",
"Australia/Lindeman",
"Australia/Lord_Howe",
"Australia/Melbourne",
"Australia/Perth",
"Australia/Sydney",
"Europe/Amsterdam",
"Europe/Andorra",
"Europe/Astrakhan",
"Europe/Athens",
"Europe/Belgrade",
"Europe/Berlin",
"Europe/Bratislava",
"Europe/Brussels",
"Europe/Bucharest",
"Europe/Budapest",
"Europe/Busingen",
"Europe/Chisinau",
"Europe/Copenhagen",
"Europe/Dublin",
"Europe/Gibraltar",
"Europe/Guernsey",
"Europe/Helsinki",
"Europe/Isle_of_Man",
"Europe/Istanbul",
"Europe/Jersey",
"Europe/Kaliningrad",
"Europe/Kiev",
"Europe/Kirov",
"Europe/Lisbon",
"Europe/Ljubljana",
"Europe/London",
"Europe/Luxembourg",
"Europe/Madrid",
"Europe/Malta",
"Europe/Mariehamn",
"Europe/Minsk",
"Europe/Monaco",
"Europe/Moscow",
"Europe/Oslo",
"Europe/Paris",
"Europe/Podgorica",
"Europe/Prague",
"Europe/Riga",
"Europe/Rome",
"Europe/Samara",
"Europe/San_Marino",
"Europe/Sarajevo",
"Europe/Saratov",
"Europe/Simferopol",
"Europe/Skopje",
"Europe/Sofia",
"Europe/Stockholm",
"Europe/Tallinn",
"Europe/Tirane",
"Europe/Ulyanovsk",
"Europe/Uzhgorod",
"Europe/Vaduz",
"Europe/Vatican",
"Europe/Vienna",
"Europe/Vilnius",
"Europe/Volgograd",
"Europe/Warsaw",
"Europe/Zagreb",
"Europe/Zaporozhye",
"Europe/Zurich",
"Indian/Antananarivo",
"Indian/Chagos",
"Indian/Christmas",
"Indian/Cocos",
"Indian/Comoro",
"Indian/Kerguelen",
"Indian/Mahe",
"Indian/Maldives",
"Indian/Mauritius",
"Indian/Mayotte",
"Indian/Reunion",
"Pacific/Apia",
"Pacific/Auckland",
"Pacific/Bougainville",
"Pacific/Chatham",
"Pacific/Chuuk",
"Pacific/Easter",
"Pacific/Efate",
"Pacific/Enderbury",
"Pacific/Fakaofo",
"Pacific/Fiji",
"Pacific/Funafuti",
"Pacific/Galapagos",
"Pacific/Gambier",
"Pacific/Guadalcanal",
"Pacific/Guam",
"Pacific/Honolulu",
"Pacific/Kiritimati",
"Pacific/Kosrae",
"Pacific/Kwajalein",
"Pacific/Majuro",
"Pacific/Midway",
"Pacific/Nauru",
"Pacific/Niue",
"Pacific/Norfolk",
"Pacific/Noumea",
"Pacific/Pago_Pago",
"Pacific/Palau",
"Pacific/Pitcairn",
"Pacific/Pohnpei",
"Pacific/Port_Moresby",
"Pacific/Rarotonga",
"Pacific/Tahiti",
"Pacific/Tarawa",
"Pacific/Tongatapu",
"Pacific/Wake",
"Pacific/Wallis",
"US/Alaska",
"US/Arizona",
"US/Central",
"US/Eastern",
"US/Hawaii",
"US/Mountain",
"US/Pacific",
    // Add more timezones here
  ].sort();
  
    /**
	 * @param {number} index
	 */
    function deleteTimezone(index) {
      selectedTimezones.splice(index, 1);
      timezoneCount--;
      selectedTimezones = [...selectedTimezones]; // trigger Svelte reactivity
    }
  
    function convertTimezones() {
    const datetime = new Date(currentDateTime);
    /**
     * @type {any[]}
     */
    const resultText = [];

    selectedTimezones.forEach((timezone) => {
      if (timezone) {
        const convertedDate = new Date(
          datetime.toLocaleString('en-US', { timeZone: timezone })
        );
        // Extract the city name from the timezone string
        const cityName = timezone.split('/').pop().replace(/_/g, ' ');
        resultText.push({
          timezone: cityName, // Display the city name instead of the full timezone name
          convertedDate: convertedDate.toLocaleString(),
        });
      }
    });

    convertedTimes = resultText;
  }
  </script>
  <style>
    
    body {
    font-family: Franklin Gothic Medium, sans-serif;
    background-color: transparent;
    background-image: url('world.png');
    background-repeat: no-repeat;
    width: 100%;
    height: 100%;
    position: inherit;
    background-position: center;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin: auto;
    padding: auto;
  }
  
    #title {
      text-align: center;
      color: rgb(87, 157, 167);
    }
  
    h3 {
      color: #00313D;
    }
  
    #shape {
      align-self: left;
      background: #00a9f7;
      text-align: center;
      border: 1px solid #9ce7fa7c;
      border-radius: 10px;
      box-shadow: 2px 2px 10px rgba(0, 112, 139, 0.37);
      padding: 20px;
      width: 100%;
      max-width: 400px;
      margin: 10px;
      position: inherit;
    }
  
    .button1 {
      align-self: center;
      padding: 10px;
      background-color: rgb(175, 238, 238);
      border-radius: 10px;
      border: 1px solid #fcfeffc2;
      width: 40%;
      max-width: 400px;
      margin-bottom: 10%;
      float: left;
      position: inherit;
    }
  

    .button2 {
      align-self: center;
      padding: 10px;
      background-color: paleturquoise;
      border-radius: 10px;
      border: 1px solid #fcfeffc2;
      width: 55%;
      max-width: 400px;
      margin-bottom: 10%;
      float: right;
      position: inherit;
    }
  
    .timezone-box {
        background-color: #73bafd;
        color: #00313D;
        padding: 10px;
        border-radius: 5px;
        margin: 10px;
        width: 100%;
        max-width: 400px;
        align-self: center;
        display: flex;
        justify-content: space-between;
        align-items: center; /* Adjust alignment of the elements */
    }

    .timezone label {
        flex: 1;
        margin-right: 10px;
    }
  
    #datetime {
      border-radius: 5px;
      border-color: #FFFFFF;
      width: 100%;
      padding: 0px;
      position: inherit;
    }
    
    #addedTimezones {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
    }

    #container {
        display: flex;
        justify-content: space-between;
        align-items: stretch;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }
  
    .timezone {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      margin-bottom: 20px;
      width: 100%;
      max-width: 400px;
      position: inherit;
    }
  
    .timezone label {
        flex: 1;
        margin-right: 10px;
    }

    .timezone-box, .button1, .button2 {
        width: 100%;
        max-width: 400px;
    }

    .deleteBtn {
        flex: 1;
        padding: 10px;
        background-color: rgb(255, 124, 100);
        border-radius: 5px;
        color: #FFFFFF;
        border: none;
        cursor: pointer;
        max-width: 50px;
        margin-left: 10px; /* Adjust margin to create space between select box and delete button */
    }
  
    #result {
        float: right;
    }
  
    .result-box {
      text-align: left;
      background-color: #00a9f7;
      color: snow;
      padding: 10px;
      border-radius: 10px;
      margin: 10px;
      width: 100%;
      max-width: 400px;
      position: inherit;
    }

    #timezones {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 0;
        width: 100%;
        max-width: 400px;
    }

    #timezones {
        padding-right: 10px;
        float: left;
    }

    .button1,
    .button2 {
        width: 40%;
        max-width: 200px;
        margin: 10px;
    }
  
    #result {
        float: right;
        width: 100%;
        max-width: 400px;
        align-self: flex-end; /* Align the converted time box to the right */
    }

    @media (max-width: 600px) {
        .button1,
        .button2,
        .timezone-box,
        #datetime {
            width: 90%;
        }

        #container {
            flex-direction: column; /* Align elements in a column for smaller screens */
            align-items: center;
        }

        #result {
            align-self: center; /* Align the converted time box to the center for smaller screens */
        }
    }

    /* Add specific styles for floating elements to the left and right */
    #timezones,
    .button1,
    .button2 {
        float: left;
    }
  
    #timezones {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 0%;
    }
  
    #datetime {
      flex: 1;
      border-radius: 5px;
      border-color: #FFFFFF;
      max-width: calc(100% - 100px);
      margin: 10px 5px;
    }

    #addedTimezones {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }
  
    #left-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        margin-right: 20px;
        text-align: center;
    }

    #right-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        text-align: center;
    }

  </style>
  
  <body>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" integrity="sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <h1 id="title">Timezone Converter</h1>
    <div id="container">
        <div id="left-container">
            <!-- Left section content here -->
            <div id="timezones" style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap;">
                <div class="timezone" id="shape" style="width: 100%; max-width: 400px; text-align: center;">
                    <label for="datetime">
                        <h2 style="color: snow;">Date and Time:</h2>
                    </label>
                    <input type="datetime-local" bind:value={currentDateTime} id="datetime" style="width: 100%; max-width: 400px; border-radius: 5px; border-color: #FFFFFF;">
                </div>
            </div>
            <div>
                <div id="addedTimezones" style="display: flex; flex-wrap: wrap; justify-content: center;">
                    {#each selectedTimezones as timezone, index}
                        <div class="timezone-box" style="width: 45%; max-width: 200px; margin: 10px; display: flex; flex-direction: column; align-items: center;">
                            <label for={"timezone" + index} style="margin-bottom: 10px;">Timezone {index + 1}:</label>
                            <div class="timezone" style="width: 100%; display: flex; flex-direction: row; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                <div style="flex: 1; display: flex; align-items: center;">
                                    <input list={"timezones" + index} bind:value={timezone} style="width: 100%; height: 40px; margin-bottom: 10px; border-radius: 5px; padding: 5px;" placeholder="Search or select timezone">
                                    <datalist id={"timezones" + index}>
                                        {#each sortedTimezones as sortedTimezone}
                                            <option value={sortedTimezone}>{sortedTimezone}</option>
                                        {/each}
                                    </datalist>
                                </div>
                                <button on:click={() => deleteTimezone(index)} class="deleteBtn" style="padding: 10px; height: 40px; background-color: rgb(255, 124, 100); margin-bottom: 10px; border-radius: 5px; color: #FFFFFF; border: none; cursor: pointer; max-width: 50px; margin-left: 10px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
                
                <div style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap; margin-top: 20px;">
                    <button on:click={addTimezone} class="button1" style="width: 40%; max-width: 200px; margin: 10px;">
                        <h2>Add Timezone</h2>
                    </button>
                    <button on:click={convertTimezones} class="button2" style="width: 55%; max-width: 200px; margin: 10px;">
                        <h2>Convert Timezones</h2>
                    </button>
                </div>
            </div>
        </div>

        <div id="right-container">
            <!-- Right section content here -->
            <div id="result">
                {#if convertedTimes.length > 0}
                  <div class="result-box">
                    <h3>Converted Times:</h3>
                    <br />
                    {#each convertedTimes as { timezone, convertedDate }, index}
                      <p>
                        <strong>{timezone}</strong>: {convertedDate}
                      </p>
                      {#if index !== convertedTimes.length - 1}
                        <br />
                      {/if}
                    {/each}
                  </div>
                {/if}
              </div>
        </div>
    </div>
</body>