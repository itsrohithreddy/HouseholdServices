const ProfSrvcsHistory = Vue.component("ProfSrvcsHistoryComponent",{
    template:`
    <div>
    <!-- Completed/Rejected Service Requests -->
    <div>
    <h3>Completed/Rejected Requests</h3>
    <div v-if="serviceRequests.length" class="container ProfSrvcsHistoryComponent-container">
        <!-- Iterate over the service requests array -->
        <div v-for="srvcreq in serviceRequests" :key="srvcreq.srvcreq_id" class="ProfSrvcsHistoryComponent-card card my-3">
        <!-- Card Content -->
        <div class="card-content ProfSrvcsHistoryComponent-card-content">
            <div class="card-body ProfSrvcsHistoryComponent-card-body">
                <h5 class="ProfSrvcsHistoryComponent-card-title card-title">{{ srvcreq.srvc_name }}</h5>
                <p class="ProfSrvcsHistoryComponent-card-text card-text">
                    <strong>Category: </strong> {{ srvcreq.srvc_cat }}
                </p>
                <p class="ProfSrvcsHistoryComponent-card-text card-text">
                    <strong>Status: </strong> {{ srvcreq.srvc_status }}
                </p>
                <p>
                    <strong>Customer Name: </strong> {{ srvcreq.customer_name }}
                </p>
                <p v-if="srvcreq.prof_rating !== -1">
                    <strong>Rating Given: </strong> {{ srvcreq.prof_rating }}
                </p>
                <p>
                    <strong>Date Requested: </strong> {{ srvcreq.date_srvcreq }}
                </p>
                
                <!-- Action Buttons -->
                <div v-if="srvcreq.prof_rating === -1 && srvcreq.srvc_status === 'accepted'" class="card-buttons">
                    <button class="btn btn-outline-primary btn-sm" @click="rateModalFunc(srvcreq)">Rate</button>
                </div>
            </div>
        </div>
        </div>
    </div>

    <div v-else style="display: flex; flex-direction: column; align-items: center;text-align: center;">
        <p><span style="color:blue">No Completed/Rejected Requests</span></p>
    </div>
    <div>

    

    <div v-if="servicereq_selected" id="myModal_Rate" class="ProfSrvcsHistoryComponent-modal modal" style="position:fixed;top:15%;left:30%;width: 50%;height : 70%;max-width:500px;">
        <div class="ProfSrvcsHistoryComponent-modal-content modal-content" style="width: 100%">
            <span class="ProfSrvcsHistoryComponent-close" @click="closeRateModal()">&times;</span> 
            <form class="form">
                <div class="mb-3">
                    <div class="mb-3">
                        <label for="service_rating" class="form-label">Rating(1-5 -> 1 : lowest , 5 : highest) <span style="color:red;">*</span> </label>
                        <input type="number" min="1" max="5" step="0.1" class="form-control" id="service_rating" name="service_rating" v-model="servicereq_selected.prof_rating" required placeholder="Give rating">
                    </div>
                    <div class="mb-3">
                        <label for="service_review" class="form-label">Review</label>
                        <input type="text" class="form-control" id="service_review" name="service_review" v-model="servicereq_selected.prof_review" placeholder = "Write some review">
                    </div>
                    <!-- <input type="hidden" name="servicereq_id" id="servicereq_id" v-model="servicereq_selected.srvcreq_id"> -->
                </div>
                <button type="button" :id="'submit_rating_' + servicereq_selected.srvcreq_id" class="btn btn-outline-primary btn-sm" @click="submitRating($event)">Submit Rating</button>
            </form>
        </div>
    </div>
    </div>
    `,
    data() {
        return {
            serviceRequests: [], // Holds the data fetched from the API
            servicereq_selected : null,
        }
    },
    methods: {
        async fetchServiceRequests() {
            try {
              const user_id = this.$route.params.id || localStorage.getItem('user_id')
              const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
              // console.log("CSRF Token : ",csrfToken)
              const response = await fetch(`/api/srvc_req/${ user_id }/0`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  'X-CSRF-Token': csrfToken
                },
              });
        
              if (!response.ok) {
                const errorData = await response.json();
                console.error("Error submitting request:", errorData.message);
                throw new Error(`HTTP Error: ${errorData.status} - ${errorData.status}`);
              }
        
              const data = await response.json();
        
              if (data.status === "success" && data.flag === 1) {
                this.serviceRequests = data.data_prof;
                // this.rating_given = (this.serviceRequests.prof_rating == -1) ? false : true
                console.log("Accepted/Rejected Services fetched successfully.")
      
              }
              else {
                  console.error("Failed to fetch services:", data.message);
                }
            } 
            catch (error) {
              console.error("Error fetching services:", error);
            }
        },
        async submitRating(event){
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            // const srvcreq_id = document.getElementById("servicereq_id").value
            const form = event.target.closest("form");
            // console.log(this.servicereq_selected.srvcreq_id)
            const srvcreq_id = this.servicereq_selected.srvcreq_id
            const button_rate = form.querySelector(`#submit_rating_${this.servicereq_selected.srvcreq_id}`); // Replace with the actual button ID
            button_rate.disabled = true;
            // Change the button content
            button_rate.textContent = "Submiting.....";
            const requestData = {
                prof_rating: this.servicereq_selected.prof_rating,
                prof_review: this.servicereq_selected.prof_review,
            };
            try{
                const response = await fetch(`/api/rating/prof/${srvcreq_id}`, {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    'X-CSRF-Token': csrfToken
                    },
                    body:JSON.stringify(requestData),
                });
            
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Error submitting request:", errorData.message);
                    throw new Error(`HTTP Error: ${errorData.status} - ${errorData.status}`);
                }
            
                const data = await response.json();
            
                if (data.status === "success" && data.flag === 1) {
                    console.log("Rating Done.", data.message);
                    // this.$router.push('/profile')
                    // Disable the button
                    button_rate.disabled = true;
                    // Change the button content
                    button_rate.textContent = "Submited";
                    this.closeRateModal();
                    // this.rating_given = true

                }
                else {
                    console.error("Failed", data.message);
                    window.location.reload();
                }
            } 
            catch (error) {
                console.error("Error", error.message);
                window.location.reload();
            }
        },


        rateModalFunc(servicereq){
            this.servicereq_selected = servicereq;
            this.$nextTick(() => {
                const modal = document.getElementById('myModal_Rate');
                if (modal) {
                    modal.style.display = 'block';
                } else {
                    console.error("Modal not found in DOM");
                }
            });
            // document.getElementById('myModal_Rate').style.display = 'block';
            // document.getElementById('servicereq_id').value = servicereq.srvcreq_id;
        },


        closeRateModal() {
            document.getElementById("myModal_Rate").style.display='none'
            this.servicereq_selected = null
        },
    },
    mounted() {
        this.fetchServiceRequests()
    }
})

export default ProfSrvcsHistory;