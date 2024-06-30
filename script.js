// صلي ع الحبيب قلبك يطيب :)
function getProfile() {
    let handle1 = document.getElementById("handleInput1").value;
    let handle2 = document.getElementById("handleInput2").value;

    if (handle2 === "") {
        handle2 = handle1;
    }

    if (handle1 === "") {
        handle1 = handle2;
    }

    const urlInfo1 = `https://codeforces.com/api/user.info?handles=${handle1}`;
    const urlInfo2 = `https://codeforces.com/api/user.info?handles=${handle2}`;
    const urlRating1 = `https://codeforces.com/api/user.rating?handle=${handle1}`;
    const urlSubmissions1 = `https://codeforces.com/api/user.status?handle=${handle1}&from=1&count=10000`;
    const urlSubmissions2 = `https://codeforces.com/api/user.status?handle=${handle2}&from=1&count=10000`;

    Promise.all([
        fetch(urlInfo1).then(response => response.json()),
        fetch(urlInfo2).then(response => response.json()),
        fetch(urlRating1).then(response => response.json()),
        fetch(urlSubmissions1).then(response => response.json()),
        fetch(urlSubmissions2).then(response => response.json())
    ])
    .then(data => {
        const userInfo1 = data[0].result[0];
        const userInfo2 = data[1].result[0];
        const ratingData1 = data[2].result;
        const submissionsData1 = data[3].result;
        const submissionsData2 = data[4].result;

        const rank = userInfo1.rank;
        const rating = userInfo1.rating;
        const name = userInfo1.firstName + " " + userInfo1.lastName;
        const profilePic1 = userInfo1.titlePhoto;
        const profilePic2 = userInfo2.titlePhoto;
        const university = userInfo1.organization;
        const maxRating = Math.max(...ratingData1.map(entry => entry.newRating));
        const contestCount = ratingData1.length;
        const solvedProblems1 = submissionsData1.filter(item => item.verdict === "OK");
        const uniqueSolvedProblems1 = removeDuplicates(solvedProblems1);
        const solvedProblems2 = submissionsData2.filter(item => item.verdict === "OK");
        const uniqueSolvedProblems2 = removeDuplicates(solvedProblems2);

        displayProfile(name, rank, rating, maxRating, profilePic1, profilePic2, university, contestCount, uniqueSolvedProblems1.length, uniqueSolvedProblems2);
        displaySolvedProblems(uniqueSolvedProblems1, uniqueSolvedProblems2);

        // Show the challenge section after displaying the profiles
        document.getElementById("challengeSection").style.display = "block";
    })
    .catch(error => console.log("Error fetching data: ", error));
}

function displayProfile(name, rank, rating, maxRating, profilePic1, profilePic2, university, contestCount, solvedCount1, solvedProblems2) {
    const profileInfo = document.getElementById("profileInfo");
    profileInfo.innerHTML = `
        <div class="card">
            <div class="card-body">
                <div class="text-center mb-3">
                    <img src="${profilePic1}" alt="Profile Picture" class="img-fluid rounded-circle" style="width: 100px; height: 100px; margin-right: 10px;">
                    <span class="vs-sign">vs</span>
                    <img src="${profilePic2}" alt="Profile Picture" class="img-fluid rounded-circle" style="width: 100px; height: 100px;">
                </div>
                <p class="card-text">Name: ${name}</p>
                <p class="card-text">Rank: <span class="${getRankColor(rank)}">${rank}</span></p>
                <p class="card-text">Rating: <span class="${getRatingColor(rating)}">${rating}</span></p>
                <p class="card-text">Max Rating: <span class="${getRatingColor(maxRating)}">${maxRating}</span></p>
                <p class="card-text">University: ${university || 'Not specified'}</p>
                <p class="card-text">Contests: ${contestCount}</p>
                <p class="card-text">Solved Problems: ${solvedCount1}</p>
            </div>
        </div>`;
}

function getChallenge() {
    const selectedRating = document.getElementById("ratingSelect").value;
    if (!selectedRating) {
        alert("Please select a rating");
        return;
    }

    const handle1 = document.getElementById("handleInput1").value;
    const handle2 = document.getElementById("handleInput2").value;

    const urlSubmissions1 = `https://codeforces.com/api/user.status?handle=${handle1}&from=1&count=10000`;
    const urlSubmissions2 = `https://codeforces.com/api/user.status?handle=${handle2}&from=1&count=10000`;

    Promise.all([
        fetch(urlSubmissions1).then(response => response.json()),
        fetch(urlSubmissions2).then(response => response.json())
    ])
    .then(data => {
        const submissionsData1 = data[0].result;
        const submissionsData2 = data[1].result;

        const solvedProblems1 = submissionsData1.filter(item => item.verdict === "OK" && item.problem.rating == selectedRating);
        const uniqueSolvedProblems1 = removeDuplicates(solvedProblems1);
        const solvedProblems2 = submissionsData2.filter(item => item.verdict === "OK");
        const uniqueSolvedProblems2 = removeDuplicates(solvedProblems2);

        const unsolvedProblems = uniqueSolvedProblems1.filter(problem => 
            !uniqueSolvedProblems2.some(p => p.problem.contestId === problem.problem.contestId && p.problem.index === problem.problem.index)
        );

        const challengeLinkDiv = document.getElementById("challengeLink");
        challengeLinkDiv.innerHTML = ""; // Clear any existing content

        if (unsolvedProblems.length === 0) {
            challengeLinkDiv.innerHTML = "<p>You already solve all problems your rival solved ;)</p>";
        } else {
            const randomProblem = unsolvedProblems[Math.floor(Math.random() * unsolvedProblems.length)];
            const problemLink = `https://codeforces.com/contest/${randomProblem.problem.contestId}/problem/${randomProblem.problem.index}`;
            const problemLinkElement = document.createElement("a");
            problemLinkElement.href = problemLink;
            problemLinkElement.textContent = `Your Challenge: ${randomProblem.problem.name}`; // Display "Your Challenge: Problem Name"
            problemLinkElement.target = "_blank";
            challengeLinkDiv.appendChild(problemLinkElement);
        }
    })
    .catch(error => console.log("Error fetching data: ", error));
}



function createProblemListItem(problem, solved) {
    const li = document.createElement("li");
    li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
    
    const problemLink = document.createElement("a");
    problemLink.href = `https://codeforces.com/contest/${problem.problem.contestId}/problem/${problem.problem.index}`;
    problemLink.textContent = problem.problem.name;
    problemLink.classList.add("problem-link");
    problemLink.target = "_blank";

    const icon = document.createElement("span");
    icon.classList.add("badge", "badge-pill", solved ? "badge-success" : "badge-danger");
    icon.textContent = solved ? "✓" : "✗";

    li.appendChild(problemLink);
    li.appendChild(icon);
    
    return li;
}

function displaySolvedProblems(problems1, problems2) {
    const problemsDiv = document.getElementById("problems");
    problemsDiv.innerHTML = "";

    const groupedProblems1 = {};
    problems1.forEach(problem => {
        const rating = problem.problem.rating;
        if (!groupedProblems1[rating]) {
            groupedProblems1[rating] = [];
        }
        groupedProblems1[rating].push(problem);
    });

    for (const rating in groupedProblems1) {
        const problemList1 = groupedProblems1[rating];
        const problemCategory = document.createElement("div");
        problemCategory.classList.add("problem-category");
        const ratingHeading = document.createElement("h2");
        ratingHeading.classList.add("text-primary");
        ratingHeading.innerHTML = `Rating: <span class="${getRatingColor(rating)}">${rating}</span> (${problemList1.length} problems, ✓: ${problemList1.filter(problem => problems2.some(p => p.problem.contestId === problem.problem.contestId && p.problem.index === problem.problem.index)).length}, x: ${problemList1.filter(problem => !problems2.some(p => p.problem.contestId === problem.problem.contestId && p.problem.index === problem.problem.index)).length}) ▼`;
        ratingHeading.addEventListener("click", function() {
            const list = this.nextElementSibling;
            list.classList.toggle("active");
        });
        problemCategory.appendChild(ratingHeading);
        const ul = document.createElement("ul");
        ul.classList.add("list-group", "problem-list");

        problemList1.filter(problem => !problems2.some(p => p.problem.contestId === problem.problem.contestId && p.problem.index === problem.problem.index)).forEach(problem => {
            const li = createProblemListItem(problem, false);
            ul.appendChild(li);
        });

        problemList1.filter(problem => problems2.some(p => p.problem.contestId === problem.problem.contestId && p.problem.index === problem.problem.index)).forEach(problem => {
            const li = createProblemListItem(problem, true);
            ul.appendChild(li);
        });

        problemCategory.appendChild(ul);
        problemsDiv.appendChild(problemCategory);
    }
}

function removeDuplicates(arr) {
    const uniqueArray = arr.filter((problem, index, self) => 
        index === self.findIndex(p => 
            p.problem.contestId === problem.problem.contestId && p.problem.index === problem.problem.index));
    return uniqueArray;
}

function getRankColor(rank) {
    switch(rank) {
        case "legendary grandmaster":
        case "international grandmaster":
            return "legendary-grandmaster";
        case "grandmaster":
            return "grandmaster";
        case "international master":
            return "international-master";
        case "candidate master":
            return "candidate-master";
        case "expert":
            return "expert";
        case "specialist":
            return "specialist";
        case "pupil":
            return "pupil";
        case "newbie":
            return "newbie";
        default:
            return "";
    }
}

function getRatingColor(rating) {
    if (rating >= 2400) {
        return "legendary-grandmaster";
    } else if (rating >= 2300) {
        return "grandmaster";
    } else if (rating >= 2100) {
        return "international-master";
    } else if (rating >= 1900) {
        return "candidate-master";
    } else if (rating >= 1600) {
        return "expert";
    } else if (rating >= 1400) {
        return "specialist";
    } else if (rating >= 1200) {
        return "pupil";
    } else {
        return "newbie";
    }
}

document.getElementById("currentYear").innerText = new Date().getFullYear();

function scrollToTop() {
    window.scrollTo(0, 0);
}

// randomWord.js
const words = [
    "يارب وكل من عاونهم . . . قاطع !",
    "مَتْعَيَطِش يا زلَمِة, كِلنْا مَشروع شُهداء",
    "أمَانة يا خال نِفْسي أشوفه",
    "يَابَا, مِش كَانَ بِدَّك تِطْلَع صَحَفِي؟",
    "سَبَع سِنِين شَعْرُه أبْيَض وكيرلي وحِلو",
    "كُنْتَ نَاوِي اعْمِلَّهَا عِيدَ مِيلَادٍ",
    "مِين ضَلَّ عَايَشَ؟",
    "بِدِّي أَلْعَب, بِدِّي أَلْعَب بَسْ",
    "خَلِّية فِي حُضْنِي, خَلِّية فِي حُضْنِي",
    "ماما أنا تِعِبْت من هذا الصوت",
    "بِدِّي شَعْرَةً مِنُّه",
    "..مَعْلِش",
    "روح الروح, هذى روح الروح",
    "والله ياما أخذت ٥٨٠ إبرة عشانه",
    "هَي أِمَّي.. بَعْرِفْها مِن شَعْرَهَا"
];

function displayWord(word, index, speed) {
    const wordDisplay = document.getElementById("wordDisplay");
    wordDisplay.textContent = word.slice(0, index); 

    if (index < word.length) {
    setTimeout(() => {
        displayWord(word, index + 1, speed); 
    }, speed);
    } else {
    setTimeout(updateWord, 2000); 
    }
}

function updateWord() {
    const randomIndex = Math.floor(Math.random() * words.length);
    const randomWord = words[randomIndex];
    displayWord(randomWord, 0, 100);
}

updateWord();
