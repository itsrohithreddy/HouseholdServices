const Home = Vue.component("HomeComponent", {
  data() {
    return {
      categorizedServices: {}, //{"Electrical":[{"service_name":"Wiring"},{"service_name":"Cabling"},{"service_name":"Switching"}]}, // Holds the data fetched from the API
      service_selected : null,
    };
  },
  methods: {
    async fetchServices() {
      try {
        const response = await fetch("/api/user/serviceslist", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error submitting request:", errorData.message);
          throw new Error(`HTTP Error: ${errorData.status} - ${errorData.status}`);
        }
  
        const data = await response.json();
  
        if (data.status === "success" && data.flag === 1) {
          this.categorizedServices = data.data;
          console.log("All services fetched successfully:",this.categorizedServices);
          localStorage.setItem("search_items", JSON.stringify(data.data));
  
          // Ensure the DOM is updated before initializing the carousel
          this.$nextTick(() => {
            this.initializeCarousel();
          });

        } else {
          console.error("Failed to fetch services:", data.message);
        }
      } catch (error) {
        console.error("Error fetching services:", error.message);
      }
    },
  
    initializeCarousel() {
      const cardCount = $(".HomeComponent-card-container .HomeComponent-card").length;
      $(".HomeComponent-card-container").slick({
        slidesToShow: cardCount <= 3 ? cardCount : 4, // Dynamically adjust slidesToShow
        // slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3500,
        arrows: true,
        dots: true,
        centerMode: cardCount <= 3, // Enable centerMode when <= 3 cards
        // centerPadding: cardCount <= 3 ? "10%" : "0", // Add padding to better center the cards
        infinite: cardCount > 4, // Disable infinite loop if only 1 slide
        // variableWidth: false, // Force slides to take equal width
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
    fetch('/api/get_flash_messages')  // API to get flashed messages
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          alert(data.message);  // Show alert when the token expires
        }
    });
    this.fetchServices();
    // this.initializeCarousel();

  },
  template: `
  <div>
    <div class="container-fluid" id="main-content-1">
      <div v-for="(services,category) in categorizedServices" :key="category" class="container">
        <div class="row" style="text-align: center; margin: 10px;">
          <h3><strong>{{ category }}</strong></h3>
          <!-- <p>{{services}}</p> -->
          <div class="col-12">
            <div class="HomeComponent-card-container">

              <div v-for="service in services" :key="service.service_name" class="HomeComponent-card card">
                <div class="container HomeComponent-card_img-content card_img-content">
                  <img :src="service.service_image" :alt="service.service_name + ' Image'" class="HomeComponent-card-img-top card-img-top"/>
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
  `,
});


export default Home;