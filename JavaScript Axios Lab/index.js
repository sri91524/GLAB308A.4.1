import * as Carousel from "./Carousel.js";
// import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const API_KEY = "live_fi0dI9CEZjkyKWQ2aIjdIOgH7ICvlb7ILaDsmnOsUjE9F8drzgOLrWsnvGweQ5sg";

/**
 * 1. Create an async function "initialLoad" that does the following:
 * - Retrieve a list of breeds from the cat API using fetch().
 * - Create new <options> for each of these breeds, and append them to breedSelect.
 *  - Each option should have a value attribute equal to the id of the breed.
 *  - Each option should display text equal to the name of the breed.
 * This function should execute immediately.
 */

/**
 * 4. Change all of your fetch() functions to axios!
 * - axios has already been imported for you within index.js.
 * - If you've done everything correctly up to this point, this should be simple.
 * - If it is not simple, take a moment to re-evaluate your original code.
 * - Hint: Axios has the ability to set default headers. Use this to your advantage
 *   by setting a default header with your API key so that you do not have to
 *   send it manually with all of your requests! You can also set a default base URL!
 */
/**
 * 5. Add axios interceptors to log the time between request and response to the console.
 * - Hint: you already have access to code that does this!
 * - Add a console.log statement to indicate when requests begin.
 * - As an added challenge, try to do this on your own without referencing the lesson material.
 */

/**
 * 7. As a final element of progress indication, add the following to your axios interceptors:
 * - In your request interceptor, set the body element's cursor style to "progress."
 * - In your response interceptor, remove the progress cursor style from the body element.
 */

axios.interceptors.request.use(
    (request) =>{    
    request.metadata = request.metadata || {};
    request.metadata.startTime = new Date().getTime();
    console.log("Request begin at: ",new Date());
    progBar.style.width = "0%";
    document.body.style.cursor ="progress";
    return request;
    },
    (error) => {
        document.body.style.cursor ="default";
        throw error;    
});

axios.interceptors.response.use(
    (response) => {
        response.config.metadata.endTime = new Date().getTime();
        response.DurationInMS = response.config.metadata.endTime - response.config.metadata.startTime;
        document.body.style.cursor ="default";
        return response;
    },
    (error) => {
        error.config.metadata.endTime = new Date().getTime();
        error.DurationInMS = error.config.metadata.endTime - error.config.metadata.startTime;
        document.body.style.cursor ="default";
        throw error;
    });

axios.defaults.headers.common['x-api-key'] = API_KEY;
axios.defaults.baseURL = "https://api.thecatapi.com/v1";
const info = document.getElementById("infoDump");

//?Fetching from API use of fetch
async function initialLoad(){
    try{     
        breedSelect.innerHTML ="";
        //fetching breed details to populate dropdown and 
        //progress bar function for while loading dropdown
        const response = await axios.get("/breeds",{
            onDownloadProgress: updateProgress
        });
        
        console.log("Response Duration in ms(Initial Load) : ", response.DurationInMS);
        const breeds = response.data;
        breeds.forEach(breed =>
        {
            const option = document.createElement('option');
            option.value = breed.id;
            option.text =  breed.name;
            breedSelect.appendChild(option);
        });                           
        RefreshCarouselBreedInfo();    
    }
        catch(e){
            console.error(e);
    }
}
initialLoad();

/**
 * 2. Create an event handler for breedSelect that does the following:
 * - Retrieve information on the selected breed from the cat API using fetch().
 *  - Make sure your request is receiving multiple array items!
 *  - Check the API documentation if you're only getting a single object.
 * - For each object in the response array, create a new element for the carousel.
 *  - Append each of these new elements to the carousel.
 * - Use the other data you have been given to create an informational section within the infoDump element.
 *  - Be creative with how you create DOM elements and HTML.
 *  - Feel free to edit index.html and styles.css to suit your needs, but be careful!
 *  - Remember that functionality comes first, but user experience and design are important.
 * - Each new selection should clear, re-populate, and restart the Carousel.
 * - Add a call to this function to the end of your initialLoad function above to create the initial carousel.
 */

/**
 * 6. Next, we'll create a progress bar to indicate the request is in progress.
 * - The progressBar element has already been created for you.
 *  - You need only to modify its "width" style property to align with the request progress.
 * - In your request interceptor, set the width of the progressBar element to 0%.
 *  - This is to reset the progress with each request.
 * - Research the axios onDownloadProgress config option.
 * - Create a function "updateProgress" that receives a ProgressEvent object.
 *  - Pass this function to the axios onDownloadProgress config option in your event handler.
 * - console.log your ProgressEvent object within updateProgess, and familiarize yourself with its structure.
 *  - Update the progress of the request using the properties you are given.
 * - Note that we are not downloading a lot of data, so onDownloadProgress will likely only fire
 *   once or twice per request to this API. This is still a concept worth familiarizing yourself
 *   with for future projects.
 */

function updateProgress(progressEvent) {
    //progress bar function -- progressEvent (loaded / total)*100 -- progresspercentage% 
    if(progressEvent.lengthComputable){        
        const loaded = progressEvent.loaded;
        const total = progressEvent.total;
        const progPercentage = Math.round((loaded/total) * 100);
        progBar.style.width = `${progPercentage}%`;
    }
}

breedSelect.addEventListener("change", RefreshCarouselBreedInfo);
async function RefreshCarouselBreedInfo()
{   
    try{      
        // Fetch cat images with breed ids as filter
        //progressbar function on download
        const res = await axios.get("/images/search", {
            params: {
                limit: 10,          // Number of images to return
                breed_ids: breedSelect.value  // Filter by breed
            },
            onDownloadProgress: updateProgress
        });

        //to get favorites data to mark images if it is selected as favorite
        const resFavorite = await axios.get("/favourites")
        const dataFavorite = resFavorite.data;
        let bFav = false;

        console.log("Response Duration in ms(Breed selection change) : ", res.DurationInMS);   
        
        const breeds = res.data;        
        info.innerHTML ="";       
        Carousel.clear();          
        let strInfo = "";
        //To load carousel with images fetched based on dropdown change
        if(breeds.length > 0){
            breeds.forEach(item => {
                //if images fetched based on breed matches with the favorite image id ,
                //set bFav to true and send to createcarouselitem functionality in carousel.js
                //where images will be marked as red
                let favItem = dataFavorite.find(favourite => favourite.image_id === item.id) !== undefined;
                bFav = favItem ? true : false;             

                Carousel.appendCarousel(Carousel.createCarouselItem(item.url, item.breeds[0].name, item.id, bFav));
                
                //populate infodump with breed info

                if(strInfo === "" && item.breeds.length > 0 ){                  
                    strInfo = `<h3>${item.breeds[0].name}</h3>`;
                    strInfo += `<table style ="width:70%; background-color: rgb(225, 182, 196); cellpadding:8px">`;
                    strInfo += `<tr style="background-color:rgb(227, 134, 163);"><td><b>Origin</b></td><td>${item.breeds[0].origin}</td></tr>`;
                    strInfo += `<tr><td><b>Desscription</b></td><td>${item.breeds[0].description}</td></tr>`;
                    strInfo += `<tr style="background-color:rgb(227, 134, 163);"><td><b>Weight</b></td><td>`;
                    strInfo += `<i><b>Imperial (pounds):</b> ${item.breeds[0].weight["imperial"]}</i><br>`;
                    strInfo += `<i><b>Metric (kg):</b> ${item.breeds[0].weight["metric"]}</i>`;
                    strInfo += `</td></tr>`;                
                    strInfo += `<tr><td><b>Life Span</b></td><td>${item.breeds[0].life_span}</td></tr>`;
                    strInfo += `<tr style="background-color:rgb(227, 134, 163);"><td><b>Temperament</b></td><td>${item.breeds[0].temperament}</td></tr>`;
                    strInfo += `</table>`;
                    info.innerHTML = strInfo;                    
                }
                
            }); 
            //enable sliding functionality
            Carousel.start();        
        } 
        else
        {
            infoDump.innerHTML = `<p align="center" style="color:red;font-size:18px;">There is no information available to this breed at this point.</p>`;
        }
    }catch(e){
        console.error(e);
    }       
}

/**
 * 3. Fork your own sandbox, creating a new one named "JavaScript Axios Lab."
 */
/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *  - This is why we use the export keyword for this function.
 * - Post to the cat API's favourites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favourited,
 *   you delete that favourite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */
export async function favourite(imgId, currElement) {

    // to toggle classes for favourite and unfavourite

    let bFavorite = currElement.classList.contains("active");
  
    try{ 
        if(bFavorite){   
            //to fetch favourites filter by image         
            const resCurrFav = await axios.get('/favourites', {
                params: {                
                    image_id: imgId  // Filter by image
                }            
            });
            // if favourite image is toggled to inactive,
            //then change the color to light pink and delete it from favourite
            if(resCurrFav.data.length > 0){
                let favId = resCurrFav.data[0].id;              
                await axios.delete(`/favourites/${favId}`,{
                    headers: { 
                    'Content-Type': 'application/json; charset=UTF-8'
                    } 
                })
                  .then(response => {
                    console.log(response.data);
                  })
                  .catch(error => {
                    if (error.response) {
                      console.log(error.response.data);
                      console.log(error.response.status);                      
                    } else if (error.request) {
                      console.log(error.request);
                    } else {
                      console.log('Error', error.message);
                    }
                    console.log(error.config);
                  });
                
                currElement.style.color = "lightpink";                
            }            
        }
        else{            
                let rawBody = JSON.stringify({ 
                    "image_id": imgId        
                });
                //if inactive image is marked as favourite,
                //change color to red and add it to favourites
                const response = await axios.post('/favourites', 
                    rawBody,{ 
                    headers: { 
                            'Content-Type': 'application/json; charset=UTF-8' 
                        }
                });            
                currElement.style.color = "red"; 
            } 
                currElement.classList.toggle("active");

    }catch(error){
        console.error("Errors:", error);
    }  
}

/**
 * 9. Test your favourite() function by creating a getFavourites() function.
 * - Use Axios to get all of your favourites from the cat API.
 * - Clear the carousel and display your favourites when the button is clicked.
 *  - You will have to bind this event listener to getFavouritesBtn yourself.
 *  - Hint: you already have all of the logic built for building a carousel.
 *    If that isn't in its own function, maybe it should be so you don't have to
 *    repeat yourself in this section.
 */
getFavouritesBtn.addEventListener("click", getFavourites);
async function getFavourites(){

    try{    
            const response = await axios.get("/favourites");
            const breeds = response.data;           
            //creating carousel for favourite images on click of getfavourite button
            info.innerHTML ="";       
            Carousel.clear();            
            if(breeds.length > 0){
                breeds.forEach(item => {                   
                    let imgId = item.image.id; 
                    let imgUrl = item.image.url;                    
                    let imgAlt = `Cat image - ${imgId}`;

                    Carousel.appendCarousel(Carousel.createCarouselItem(imgUrl, imgAlt, imgId, true));                     
                }); 
                Carousel.start();
            }  
            else
            {
                infoDump.innerHTML = `<p align="center" style="color:red;font-size:18px;">There is no favorite list!!!</p>`;
                console.log("There is no favorite list!!!");
            }  
        }catch(e){
        console.error(e);
    }    
}
/**
 * 10. Test your site, thoroughly!
 * - What happens when you try to load the Malayan breed?
 *  - If this is working, good job! If not, look for the reason why and fix it!
 * - Test other breeds as well. Not every breed has the same data available, so
 *   your code should account for this.
 */
