const Search = Vue.component("SearchComponent",{
    template: `
    <div class="search-container">
        <div class="container mt-4">
            <h2 class="text-center">Search Services</h2>
            <div class="card p-4">
                <form @submit.prevent="searchServices">
                    <div class="row">
                        <div class="col-md-4">
                            <label for="category" class="form-label">Category</label>
                            <select v-model="filters.category" class="form-select">
                                <option value="">Select Category</option>
                                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label for="price" class="form-label">Max Price</label>
                            <input type="number" v-model="filters.price" class="form-control" placeholder="Enter max price">
                        </div>
                        <div class="col-md-4">
                            <label for="rating" class="form-label">Minimum Rating</label>
                            <input type="number" v-model="filters.rating" class="form-control" step="0.1" min="0" max="5" placeholder="Enter minimum rating">
                        </div>
                    </div>
                    <div class="text-center mt-3">
                        <button type="submit" class="btn btn-primary">Search</button>
                    </div>
                </form>
            </div>

            <div v-if="results" class="mt-4">
                <div class="container-fluid" id="main-content-1">
                <div v-for="(services,category) in results" :key="category" class="container">
                    <div class="row" style="text-align: center; margin: 10px;">
                    <h3><strong>{{ category }}</strong></h3>
                    <!-- <p>{{services}}</p> -->
                    <div class="col-12">
                        <div class="HomeComponent-card-container">

                        <div v-for="service in services" :key="service.service_name" class="HomeComponent-card card">
                            <div class="container HomeComponent-card_img-content card_img-content">
                            <img :src="service.service_image" :alt="service.serevice_name + ' Image'" class="HomeComponent-card-img-top card-img-top"/>
                            </div>
                            <div class="HomeComponent-card-content card-content">
                            <div class="HomeComponent-card-body card-body">
                                <p class="HomeComponent-card-text card-text"><strong>{{ service.avg_rating }}</strong><i class="fa-solid fa-star fa-xs" style="color: #FFD43B;"></i></p>
                                <p class="HomeComponent-card-text card-text"><strong>{{ service.service_name }}</strong></p>
                                <button class="btn btn-outline-success btn-sm" @click="modalFunction(service)">View</button>
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>


                <div v-if="service_selected" id="myModal_ServiceDetails" class="HomeComponent-modal modal" style="position:fixed;top:15%;left:30%;width: 50%;height : 70%;max-width:500px;">
                    <div class="HomeComponent-modal-content modal-content" style="width: 100%">
                    <span class="HomeComponent-close" @click="closeModal()">&times;</span>
                    
                    <div class="container mt-5 d-flex align-items-start justify-content-center">
                        <div>
                        <form class="form">
                            <div class="mb-3">
                                <div class="mb-3">
                                    <label for="service_name" class="form-label">Service Name</label>
                                    <input type="text" class="form-control" id="service_name" name="service_name" :value="service_selected.service_name" readonly>
                                </div>
                                <div class="mb-3">
                                    <label for="price" class="form-label">Price</label>
                                    <input type="text" class="form-control" id="price" name="price" :value="service_selected.service_base_price" readonly>
                                </div>
                                <div class="mb-3">
                                    <label for="prof_name" class="form-label">Professional Name</label>
                                    <input type="text" class="form-control" id="prof_name" name="prof_name" :value="service_selected.prof_name" readonly>
                                </div>
                                <div class="mb-3">
                                    <label for="prof_gender" class="form-label">Professional Gender</label>
                                    <input type="text" class="form-control" id="prof_gender" name="prof_gender" :value="service_selected.prof_gender" readonly>
                                </div>
                                <div class="mb-3">
                                    <label for="prof_exp" class="form-label">Professional Experience</label>
                                    <input type="text" class="form-control" id="prof_exp" name="prof_exp" :value="service_selected.prof_exp" readonly>
                                </div>
                                <!-- <input type="hidden" name="service_id" id="service_id" value="">  -->
                                <!-- <input type="hidden" name="prof_id" id="prof_id" value="">  -->
                            </div>
                            <button type="button" :id="'place_request_' + service_selected.service_id + '_' + service_selected.prof_userid" class="btn btn-outline-primary btn-sm" @click="submitRequest($event)">Place Request</button>
                        </form>
                        </div>
                    </div>
                    </div>
                </div>
            </div>


            <div v-else class="text-center mt-4 text-muted" v-if="searchPerformed">
                No results found.
            </div>

        </div>
    </div>`,
    data() {
        return {
            filters: {
                category: '',
                price: '',
                rating: ''
            },
            service_categories: [],
            allServices: null,
            results: {},
            searchPerformed: false,
            service_selected : null,
        };
    },
    methods: {
        async fetchServiceCategories(){
            try {
                // const user_id = localStorage.getItem('user_id')
                const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                // console.log("Here : ",csrfToken)
                const response = await fetch(`/api/srvc_cats`, {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    'X-CSRF-Token': csrfToken
                  },
                });
          
                if (!response.ok) {
                  const errorData = await response.json();
                  console.error("Error fetching service categories", errorData.message);
                  throw new Error(`HTTP Error: ${errorData.status} - ${errorData.status}`);
                }
          
                const data = await response.json();
          
                if (data.status === "success" && data.flag === 1) {
                  this.service_categories = data.data;
                  console.log("Service categories fetched successfully:", this.service_categories);
                  
                }
                else {
                    console.error("Failed to fetch services:", data.message);
                }
            } 
            catch (error) {
                console.error("Error fetching services:", error.message);
            }
        },
        searchServices() {
            this.results = {}; // Reset results
        
            for (const category in this.allServices) {
                // Filter services within each category
                const filteredServices = this.allServices[category].filter(service => {
                    return (
                        (!this.filters.category || category === this.filters.category) &&
                        (!this.filters.price || service.price <= this.filters.price) &&
                        (!this.filters.rating || service.rating >= this.filters.rating)
                    );
                });
        
                // If there are matched services, add them to results
                if (filteredServices.length > 0) {
                    this.results[category] = filteredServices;
                }
            }
        
            this.searchPerformed = true;
        },
        initializeCarousel() {
            const cardCount = $(".HomeComponent-card-container .HomeComponent-card").length;
            $(".HomeComponent-card-container").slick({
              slidesToShow: cardCount <= 3 ? cardCount : 4, // Dynamically adjust slidesToShow
              slidesToScroll: 1,
              autoplay: true,
              autoplaySpeed: 3500,
              arrows: true,
              dots: true,
              centerMode: cardCount <= 3, // Enable centerMode when <= 3 cards
              // centerPadding: cardCount <= 3 ? "10%" : "0", // Add padding to better center the cards
              prevArrow: '<button class="slick-prev"><i class="bi bi-arrow-left"></i></button>',
              nextArrow: '<button class="slick-next"><i class="bi bi-arrow-right"></i></button>',
            });
            
            // $(".HomeComponent-card-container").slick({
            //   slidesToShow: 4,
            //   slidesToScroll: 1,
            //   autoplay: true,
            //   autoplaySpeed: 3500,
            //   arrows: true,
            //   dots: true,
            //   prevArrow: '<button class="slick-prev"><i class="bi bi-arrow-left"></i></button>',
            //   nextArrow: '<button class="slick-next"><i class="bi bi-arrow-right"></i></button>',
            // });
          },
      
          modalFunction(service){
            if(localStorage.getItem('loggedIn') === '1'){
              this.service_selected = service;
              this.$nextTick(() => {
                  const modal = document.getElementById('myModal_ServiceDetails');
                  if (modal) {
                      modal.style.display = 'block';
                  } else {
                      console.error("Modal not found in DOM");
                  }
              });
            }
            else{
              this.$router.push(`/signin`);
            }
          },
      
          closeModal() {
            document.getElementById("myModal_ServiceDetails").style.display = 'none'
            this.servicereq_selected = null
          },
      
          async submitRequest(event) {
            const url = "/api/srvc_req";
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            const form = event.target.closest("form");
            const button_req = form.querySelector(`#place_request_${this.service_selected.service_id}_${this.service_selected.prof_userid}`);
            // Change the button content
            button_req.textContent = "Submiting.....";
            const requestData = {
              srvc_id: this.service_selected.service_id,
              prof_id: this.service_selected.prof_userid,
              customer_id: localStorage.getItem("user_id") || ''
            };
          
            try {
              const response = await fetch(url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  'X-CSRF-Token': csrfToken,
                },
                body: JSON.stringify(requestData),
              });
          
              if (!response.ok) {
                const errorData = await response.json();
                console.error("Error submitting request:", errorData.message);
                throw new Error(`HTTP Error: ${errorData.status} - ${errorData.status}`);
              }
          
              const responseData = await response.json();
              if (responseData.flag === 1 && responseData.status === "success") {
                console.log("Request submitted successfully:", responseData.message);
                button_req.textContent = "Submitted";
                button_req.textContent = "Place Request";
                this.closeModal();
              } else {
                console.error("Failed to submit request:", responseData.message);
              }
            } catch (error) {
              console.error("Error submitting request:", error);
            }
          }
    },
    mounted() {
        try {
            const storedItems = localStorage.getItem('search_items');
            this.allServices = storedItems ? JSON.parse(storedItems) : null; // Ensure it doesn't break if null or invalid
    
            if (this.allServices) {
                this.$nextTick(() => {
                    this.initializeCarousel();
                });
            }
        } catch (error) {
            console.error("Error parsing localStorage data:", error);
            this.allServices = null; // Fallback in case of error
        }
    }
})

export default Search

