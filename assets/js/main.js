const BASE_URL = "assets/data/";
const ITEMS_PER_PAGE = 6;
let currentPage = 1;
let currentFilteredDestinations = [];

function saveToLS(nameLS, valueLS){
    localStorage.setItem(nameLS, JSON.stringify(valueLS));
}
function getFromLS(nameLS){
    try{
        const data = localStorage.getItem(nameLS);
        return data ? JSON.parse(data) : null;
    }catch (e){
        console.error("Error with reading LocalStorage", e);
        return null;
    }
}

function ajaxCallBack(fileName, onSuccess){
    $.ajax({
        url: BASE_URL + fileName,
        method: "get",
        dataYtpe: "json",
        success: onSuccess,
        error: function(jqXHR, exception){
            let msg = "";

            if(jqXHR.status === 0){
                msg = "No connection";
            }else if(jqXHR.status === 404){
                msg = "File not found";
            }else if(jqXHR.status === "parseerror"){
                msg = "Problem wth JSON file upload";
            }else{
                msg = "Undefined erorr"
            }
            console.log(msg);

        }
    });
}
window.onload = function(){
    ajaxCallBack("menu.json", function(arrMenu){
        renderNavigation(arrMenu);
    });
    renderFooter();
    const page = document.body.dataset.page;

    if(page === "home"){
        ajaxCallBack("destination.json", function(arrDestinations){
            saveToLS("allDestinations", arrDestinations);
            renderDestinations(arrDestinations);

        });
            
            renderHero();
        $(document).on("click", ".BtnPage", function(){
                    currentPage = parseInt($(this).data("page"));
                    let arrDestinations = getFromLS("allDestinations");
                    renderDestinations(arrDestinations);
            });
        $(document).on("click", ".BtnFavorite", function(){
            let id = parseInt($(this).data("id"));
            addToFavorites(id);
        });
    }

    if(page === "destinations"){
        ajaxCallBack("destination.json", function(arrDestinations){
            saveToLS("allDestinations", arrDestinations);
            currentFilteredDestinations = arrDestinations;
            renderDestinations(arrDestinations);
        ajaxCallBack("sort.json", function(arrSort){
            saveToLS("allSort", arrSort);
            createDropDown(arrSort, "ddlSort", "Sort By", "sortBlock", "sort");
            $("#ddlSort").on("change", handleChange);
        });
        ajaxCallBack("continents.json", function(arrContinents){
            createDropDown(arrContinents, "ddlContinent", "Continent", "continentBlock", "");
        });
        ajaxCallBack("budgets.json", function(arrBudgets){
            createDropDown(arrBudgets, "ddlBudget", "Budget", "budgetBlock", "");
        });
        ajaxCallBack("types.json", function(arrTypes){
            createDropDown(arrTypes, "ddlType", "Type", "typeBlock", "");
        });

        $(document).on("change", "#ddlContinent", handleChange);
        $(document).on("change", "#ddlBudget", handleChange);
        $(document).on("change", "#ddlType", handleChange);
        $(document).on("keyup", "#tbSearch", handleChange);
        $(document).on("click", ".BtnPage", function(){
                    currentPage = parseInt($(this).data("page"));
                    renderDestinations(currentFilteredDestinations);
                    
            });
        $(document).on("click", ".BtnFavorite", function(){
            let id = parseInt($(this).data("id"));
            addToFavorites(id);
        });
        });
    }
    
    if(page === "planTrip"){
        ajaxCallBack("destination.json", function(arrDestinations){
            saveToLS("allDestinations", arrDestinations);
            populateDestinationSelecet(arrDestinations);
            let today = new Date().toISOString().split('T')[0];
            document.querySelector("#DateDeparture").setAttribute('min', today)
        });
        $(document).on("click", "#btnBook", handleBooking);
    }
    if(page === "favorites"){
        ajaxCallBack("destination.json", function(arrDestinations){
            saveToLS("allDestinations", arrDestinations);
            renderFavorites();

        });
        $(document).on("click", ".BtnRemoveFavorite", function(){
            let id = parseInt($(this).data("id"));
            removeFromFavorite(id);
        });
    }
    if(page === "destination-info"){
        const urlParams = new URLSearchParams(window.location.search);
        const destId = parseInt(urlParams.get("id"));
        
        ajaxCallBack("destination.json", function(arrDestinations){
            saveToLS("allDestinations", arrDestinations);
            let destination = arrDestinations.find(d => d.id === destId);
            renderDestinationDetail(destination);
        });
        $(document).on("click", ".BtnFavorite", function(){
            let id = parseInt($(this).data("id"));
            addToFavorites(id);
        });
    }
}


function renderNavigation(arrMenu){
    let html = "";
    for(let objMenu of arrMenu){
        let isDoc = objMenu.name.toLowerCase() === "documentation";
        
        let downloadAttr = isDoc ? 'download="Dokumentacija.pdf"' : "";
        html+= `<li class="nav-item"><a href="${objMenu.href}" class="nav-link" ${downloadAttr}>${objMenu.name}</a></li>`;

    }
    document.querySelector("#navMenu").innerHTML = html;
}
function renderHero(){
    document.querySelector("#hero").innerHTML = `
        <div class="HeroContent">
            <h6>YOUR NEXT ADVENTURE AWAITS</h6>
            <h1>Discover The World</h1>
            <p>Handpicked destinations for the curious traveler</p>
            <a href="destinations.html" class="BtnExplore">Explore Now</a>
        </div>
    `;
}
function renderFooter(){
    const footer = document.querySelector("#footer");
    if(!footer){ return; }

    footer.innerHTML = `
        <div class="FooterContent">
            <div class="FooterLogo">
                <a href="index.html">Wonderland</a>
                <p>Discover the world, one destination at a time.</p>
            </div>
            <div class="FooterLinks">
                <h6>Quick Links</h6>
                <ul>
                    <li><a href="index.html">Home</a></li>
                    <li><a href="destinations.html">Destinations</a></li>
                    <li><a href="planTrip.html">Plan Trip</a></li>
                    <li><a href="favorites.html">Favorites</a></li>
                    <li><a href="about.html">About</a></li>
                    <li><a href="documentation.html" download>Documentation</a></li>
                </ul>
            </div>
            <div class="FooterInfo">
                <h6>Contact</h6>
                <p>info@wonderland.com</p>
                <p>+381 60 000 0000</p>
                <p>Belgrade, Serbia</p>
            </div>
        </div>
        <div class="FooterBottom">
            <p>&copy; ${new Date().getFullYear()} Wonderland. All rights reserved.</p>
        </div>
    `;
}
function createDestinationCard(objDest, showFavoriteBtn, showRemoveBtn, showDetailsBtn){
    return `
        <article class="DestinationCard">
            <img src="${objDest.image}" alt="${objDest.name}"/>
            <div class="CardBody">
                <h3>${objDest.name}</h3>
                <p><span>Country:</span> ${objDest.country}</p>
                <p><span>Price:</span> ${objDest.price}$</p>
                <p><span>Popularity:</span> ${objDest.popularity}</p>
                ${showFavoriteBtn ? `<button class="BtnFavorite" data-id="${objDest.id}">♡ Save</button>` : ""}
                ${showRemoveBtn ? `<button class="BtnRemoveFavorite" data-id="${objDest.id}">✕ Remove</button>` : ""}
                ${showDetailsBtn ? `<br><a href="destination-information.html?id=${objDest.id}" class="BtnDetails">View Details></a>` : ""}
            </div>
        </article>
    `;
}
function renderDestinations(arrDestinations){
    const destinationsRegion = document.querySelector("#FeaturedDestination");
    if(!destinationsRegion){ return; }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = arrDestinations.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    if(pageItems.length === 0){
        destinationsRegion.innerHTML = `<p class="no-results">No destinations found.</p>`;
        return;
    }

    let html = "";
    for(let objDest of pageItems){
        html += createDestinationCard(objDest, true, false, true);;
    }
    destinationsRegion.innerHTML = html;
    renderPagination(arrDestinations);
}
function createDropDown(arr, ddlID, labelName, divID, type){
    let html = `
                <div class="form-group">
                    <label for="${ddlID}">${labelName}</label>
                    <select id="${ddlID}">
                        <option value="0">All</option>
    `;
    for(let obj of arr){
        if(type === "sort"){
            html+= `<option value = "${obj.sortValue}">${obj.sortName}</option>`;
        } else{
            html += `<option value = "${obj.value}">${obj.name}</option>`
        }
    }
    html += `
                </select>
            </div>
            `;
    document.querySelector(`#${divID}`).innerHTML = html;
}
function handleChange(){

    console.log("Sort vrednost:", $("#ddlSort").val());
    console.log("Kontinent:", $("#ddlContinent").val());
    let allDestinations = getFromLS("allDestinations");
    
    if(!allDestinations){return;}

    let arrDestinations = [...allDestinations];
    const searchTerm = $("#tbSearch").val().trim().toLowerCase();
    const selectedContinent = $("#ddlContinent").val();
    const selectedBudget = $("#ddlBudget").val();
    const selectedType = $("#ddlType").val();
    const selectedSort = document.getElementById("ddlSort").value;

    if(selectedContinent != "0"){
        arrDestinations = arrDestinations.filter(d => d.continent === selectedContinent);
    }
    if(selectedBudget != "0"){
        arrDestinations = arrDestinations.filter(d => d.budget === selectedBudget);
    }
    if(selectedType != "0"){
        arrDestinations = arrDestinations.filter(d => d.type.includes(selectedType));
    }
    //sort!
    if(searchTerm.length > 0){
        arrDestinations = arrDestinations.filter(s => s.name.toLowerCase().includes(searchTerm));
    }
    renderDestinations(arrDestinations);
    console.log("selectedSort u switchu:", selectedSort);
    switch(selectedSort){
        case "name-asc" :
            arrDestinations.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case "name-desc" :
            arrDestinations.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case "price-asc" :
            arrDestinations.sort((a, b) => a.price - b.price);
            break;
        case "price-desc" :
            arrDestinations.sort((a, b) => b.price - a.price);
            break;
        case "rating-desc" :
            arrDestinations.sort((a, b) => b.rating - a.rating);
            break;
        case "popularity-desc" :
            arrDestinations.sort((a, b) => b.popularity - a.popularity);
            break;
    }
    currentFilteredDestinations = arrDestinations;
    currentPage = 1;
    renderDestinations(currentFilteredDestinations);
}

//Paganacija - delimo na str
function renderPagination(arrDestinations){
    const paginationRegion = document.querySelector("#pagination");
    if(!paginationRegion){return;}

    const totalPages = Math.ceil(arrDestinations.length / ITEMS_PER_PAGE);

    let html = "";
    for(let i = 1; i <= totalPages; i++){
        html+= `<button class="BtnPage ${i === currentPage ? 'active' : ''}" data-page = "${i}">${i}</button>`;
    }
    paginationRegion.innerHTML = html;
}
function populateDestinationSelecet(arrDestinations){
    const select = document.querySelector("#ddlDestination");
    if(!select){return;}

    let html = `<option value = "0">Select Destination </option>`;
    for(let objDest of arrDestinations){
        html+= `<option value = "${objDest.id}">${objDest.name}</option>"`;

    }
    select.innerHTML = html;
}
function validateField(value, regex, errorMsg){
    if(!value || value.trim() === ""){return "This field is required!";}
    if(regex && !regex.test(value)){return errorMsg;}
    return null; // <= znaci da je validacija prosla
}
function handleBooking() {
    document.querySelector("#NameError").innerHTML = "";
    document.querySelector("#EmailError").innerHTML = "";
    document.querySelector("#PhoneError").innerHTML = "";

    let isValid = true;
    let name = $("#tbName").val();
    let email = $("#tbEmail").val();
    let phone = $("#tbPhone").val();
    let departureDate = $("#DateDeparture").val();
    let returnDate = $("#DateReturn").val();
    let destination = $("#ddlDestination").val();
    const msgRegion = document.querySelector("#FormMessage");
    if(msgRegion) msgRegion.innerHTML = "";

    // regex
    let nameError = validateField(name, /^[a-zA-Z\s]{3,}$/, "Name must contain at least 3 letters.");
    let emailError = validateField(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address.");
    let phoneError = validateField(phone, /^\+?[\d\s\-]{9,15}$/, "Invalid phone number.");

    if(nameError) {
        document.querySelector("#NameError").innerHTML = nameError;
        isValid = false;
    }
    if(emailError) {
        document.querySelector("#EmailError").innerHTML = emailError;
        isValid = false;
    }
    if(phoneError) {
        document.querySelector("#PhoneError").innerHTML = phoneError;
        isValid = false;
    }

    // datumi
    if(destination == "0") {
        showFormMessage("Please select a destination!", "error");
        isValid = false;
    }

    if(!departureDate || !returnDate) {
        showFormMessage("Please select both dates!", "error");
        isValid = false;
    } else {
        let dd = new Date(departureDate);
        let rd = new Date(returnDate);

        if(rd < dd) {
            showFormMessage("Return date cannot be before departure!", "error");
            isValid = false;
        } else {
            let ms = rd.getTime() - dd.getTime();
            let days = ms / (1000 * 3600 * 24);
            if(days > 30) {
                showFormMessage("Trip cannot last longer than 30 days!", "error");
                isValid = false;
            }
        }
    }

    // if true
    if(isValid) {
        let booking = {
            name: name,
            email: email,
            phone: phone,
            destinationId: destination,
            departureDate: departureDate,
            returnDate: returnDate,
            note: $("#TextAreaNote").val(),
            date: new Date().toLocaleDateString()
        };

        saveToLS("lastBooking", booking);
        showFormMessage("Your trip has been successfully booked!", "success");
    }
}
function showFormMessage(message, type){
    const msgRegion = document.querySelector("#FormMessage");

    if(!msgRegion){return;}
    msgRegion.innerHTML = `<p class = "FormMsg ${type}">${message}</p>`;
}
function addToFavorites(destinationId){
    console.log("addToFavorites pozvan, id:", destinationId);
    let favorites = getFromLS("favorites") || [];

    let exits = favorites.find(id => id === destinationId);

    if(exits){
        showFavoriteMessage("Already in your favorites!", "error");
        return;
    }

    favorites.push(destinationId);
    saveToLS("favorites", favorites);
    showFavoriteMessage("Added to favorites!", "success");
}
function showFavoriteMessage(message, type){
    $(".FavoriteAdded").remove();
    
    let added = $(`<div class="FavoriteAdded ${type}">${message}</div>`);
    $("body").append(added);

    setTimeout(function(){
        added.fadeOut(300, function(){
            $(this).remove();
        });
    }, 2000);
}
function renderFavorites(){
    console.log("favorites iz LS:", getFromLS("favorites"));
    console.log("destinations iz LS:", getFromLS("allDestinations"));

    let favoriteIds = getFromLS("favorites") || [];
    let allDestinations = getFromLS("allDestinations") || [];
    let favoriteDestination = allDestinations.filter(f => favoriteIds.includes(f.id));
    const region = document.querySelector("#FavoritesRegion");
    let html = "";

    if(!region){return;}
    if(favoriteDestination.length === 0){
        region.innerHTML = `<p class = "NoResults">No favorites yet. Start exploring <button><a href="destinations.html">Travel destinations</a></button></p>`;
        return;
    }
    for(let objDest of favoriteDestination){
        html += createDestinationCard(objDest, false, true, true);
    }
    region.innerHTML = html;

}
function removeFromFavorite(destinationId){
    let favorites = getFromLS("favorites") || [];
    favorites = favorites.filter(fId => fId !== destinationId);
    saveToLS("favorites", favorites);
    renderFavorites();
}
function renderDestinationDetail(objDest){
    const region = document.querySelector("#DestinationDetail");
    if(!region){ return; }
    if(!objDest){ 
        region.innerHTML = `<p class="NoResults">Destination not found.</p>`;
        return;
    }

    region.innerHTML = `
        <div class="DetailHero">
            <img src="${objDest.image}" alt="${objDest.name}"/>
            <div class="DetailHeroText">
                <h6>${objDest.continent}</h6>
                <h1>${objDest.name}</h1>
                <p>${objDest.country}</p>
            </div>
        </div>
        <div class="DetailBody">
            <div class="DetailInfo">
                <h2>About ${objDest.name}</h2>
                <p class="DetailDescription">${objDest.description}</p>
                <div class="DetailTags">
                    ${objDest.tags.map(tag => `<span class="Tag">#${tag}</span>`).join("")}
                </div>
            </div>
            <div class="DetailSidebar">
                <div class="DetailCard">
                    <p><span>Price<br> </span>${objDest.price}$</p>
                    <p><span>Budget<br> </span>${objDest.budget}</p>
                    <p><span>Popularity<br> </span>${objDest.popularity}/100</p>
                    <p><span>Best Season<br></span>${objDest.season.join(", ")}</p>
                    <p><span>Type<br> </span> ${objDest.type.join(", ")}</p>
                </div> <br><br>
                <a href="planTrip.html" class="BtnExplore">Book Now </a> <br><br>
                <button class="BtnFavorite" data-id="${objDest.id}">♡ Save to Favorites</button><br>
                <a href="destinations.html" class = "BtnDetails">View all destinations</a>
            </div>
        </div>
    `;
}


