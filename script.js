function getProfile() {
    let handle1 = document.getElementById("handleInput1").value;
    let handle2 = document.getElementById("handleInput2").value;

    if (handle2 == "") {
        handle2 = handle1;
    }

    if (handle1 == "") {
        handle1 = handle2;
    }

    const urlInfo1 = `https://codeforces.com/api/user.info?handles=${handle1}`;
    const urlRating1 = `https://codeforces.com/api/user.rating?handle=${handle1}`;
    const urlSubmissions1 = `https://codeforces.com/api/user.status?handle=${handle1}&from=1&count=10000`;
    const urlSubmissions2 = `https://codeforces.com/api/user.status?handle=${handle2}&from=1&count=10000`;

    fetch(urlInfo1)
        .then(response => response.json())
        .then(data => {
            const userInfo = data.result[0];
            const rank = userInfo.rank;
            const rating = userInfo.rating;
            const name = userInfo.firstName + " " + userInfo.lastName;
            const profilePic = userInfo.titlePhoto;
            const university = userInfo.organization;

            fetch(urlRating1)
                .then(response => response.json())
                .then(data => {
                    const maxRating = Math.max(...data.result.map(entry => entry.newRating));
                    const contestCount = data.result.length;

                    fetch(urlSubmissions1)
                        .then(response => response.json())
                        .then(data => {
                            const solvedProblems1 = data.result.filter(item => item.verdict === "OK");
                            const uniqueSolvedProblems1 = removeDuplicates(solvedProblems1);

                            fetch(urlSubmissions2)
                                .then(response => response.json())
                                .then(data => {
                                    const solvedProblems2 = data.result.filter(item => item.verdict === "OK");
                                    const uniqueSolvedProblems2 = removeDuplicates(solvedProblems2);

                                    displayProfile(name, rank, rating, maxRating, profilePic, university, contestCount, uniqueSolvedProblems1.length, uniqueSolvedProblems2);
                                    displaySolvedProblems(uniqueSolvedProblems1, uniqueSolvedProblems2);
                                })
                                .catch(error => console.log("Error fetching submissions for handle 2: ", error));
                        })
                        .catch(error => console.log("Error fetching submissions for handle 1: ", error));
                })
                .catch(error => console.log("Error fetching rating for handle 1: ", error));
        })
        .catch(error => console.log("Error fetching profile for handle 1: ", error));
}

function displayProfile(name, rank, rating, maxRating, profilePic, university, contestCount, solvedCount1, solvedProblems2) {
    const profileInfo = document.getElementById("profileInfo");
    profileInfo.innerHTML = `
        <div class="card">
            <div class="card-body">
                <div class="text-center mb-3">
                    <img src="${profilePic}" alt="Profile Picture" class="img-fluid rounded-circle" style="width: 100px; height: 100px;">
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
    icon.textContent = solved ? "Accepted" : "✗";

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

        // Creating list items for problems without the "x" mark first
        problemList1.filter(problem => !problems2.some(p => p.problem.contestId === problem.problem.contestId && p.problem.index === problem.problem.index)).forEach(problem => {
            const li = createProblemListItem(problem, false);
            ul.appendChild(li);
        });

        // Creating list items for solved problems after
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
