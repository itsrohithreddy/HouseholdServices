const AdminDetails = Vue.component("",{
    template:`
    <div id="AdminDetails-fullpage">
        <div v-if="entity === 'Customers'">
            <h1 style="text-align: center;color: #333;">Customers</h1>

            <div v-if="customers && customers.length > 0">
                <div 
                v-for="customer in customers" 
                :key="customer['user_id']" 
                class="card my-2"
                >
                    <div class="card-header">
                        <h5><strong>Name:</strong> {{ customer['user_fullname'] }}</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text"><strong>UserName(Email) : </strong> {{ customer['user_username'] }}</p>
                        <p class="card-text"><strong>User Role:</strong> Customer </p>
                        <button type="button" class="btn btn-outline-primary btn-md" @click="viewDetails(customer['user_id'])">
                            View
                        </button>
                        <button type="button" class="btn btn-outline-primary btn-md" @click="block(customer['user_id'])">
                            Block
                        </button>
                    </div>
                </div>    
            </div>

            <div v-else>
                <div class="card my-2">
                    <div class="card-header">
                        <h5 style="text-align: center;"><strong>No Customers Found</strong></h5>
                    </div>
                </div>
            </div>
        </div>




        <div v-if="entity === 'Professionals'">
            <h1 style="text-align: center;color: #333;">Professionals</h1>

            <div v-if="professionals && professionals.length > 0">
                <div 
                v-for="professional in professionals" 
                :key="professional['user_id']" 
                class="card my-2"
                >
                    <div class="card-header">
                        <h5><strong>Name:</strong> {{ professional['user_fullname'] }}</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text"><strong>UserName(Email) : </strong> {{ professional['user_username'] }}</p>
                        <p class="card-text"><strong>User Role:</strong> Professional </p>
                        <button type="button" class="btn btn-outline-primary btn-md" @click="viewDetails(professional['user_id'])">
                            View
                        </button>
                        <button type="button" class="btn btn-outline-danger btn-md" @click="block(professional['user_id'])">
                            Block
                        </button>
                        <button type="button" class="btn btn-outline-primary btn-md" @click="redirect1(professional['user_id'])">
                            Completed Reqs 
                        </button>
                        <button type="button" class="btn btn-outline-primary btn-md" @click="redirect2(professional['user_id'])">
                            Pending Reqs
                        </button>
                    </div>
                </div>    
            </div>

            <div v-else>
                <div class="card my-2">
                <div class="card-header">
                    <h5 style="text-align: center;"><strong>No Professionals Found</strong></h5>
                </div>
                </div>
            </div>
        </div>





        <div v-if="entity === 'Service Categories'">
            <h1 style="text-align: center;color: #333;">Service Categories</h1>

            <div v-if="srvc_cats && srvc_cats.length > 0">
                <div 
                v-for="srvc_cat in srvc_cats" 
                :key="srvc_cat['service_id']" 
                class="card my-2"
                >
                    <div class="card-header">
                        <h5><strong>Name:</strong> {{ srvc_cat['service_category'] }}</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text"><strong>Description : </strong> {{ srvc_cat['service_dscp'] }}</p>
                        <p class="card-text"><strong>Base Price : </strong> {{ srvc_cat['service_base_price'] }}</p>
                        <p class="card-text"><strong>Time Required(in days) : </strong> {{ srvc_cat['time_req'] }}</p>
                        <!-- Update button here later -->
                    </div>
                </div>    
            </div>

            <div v-else>
                <div class="card my-2">
                <div class="card-header">
                    <h5 style="text-align: center;"><strong>No Service Categories found Found</strong></h5>
                </div>
                </div>
            </div>
        </div>



    </div>
    `,
    data() {
        return {
            entity : "",
            customers : [],
            professionals : [],
            srvc_cats : []
        }
    },
    methods : {
        setup(){
            this.entity = this.$route.params.entity;
        },
        async fetchEntity(){
            if(this.entity !== 'Service Categories'){
                try {
                    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                    const response = await fetch("/api/users", {
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
                        if(this.entity === 'Customers'){
                            for (const x of data.data) {
                               
                                if(x.user_role === 'cust'){
                                    this.customers.push(x)
                                }
                            }
                            console.log(this.customers)
                        }
                        else{
                            for (const x of data.data) {
                                
                                if(x.user_role === 'prof'){
                                    this.professionals.push(x)
                                }
                            }
                            console.log(this.professionals)
                        }
                    }
                    else {
                        console.error("Failed to fetch :", data.message);
                    }
                }
                catch (error) {
                    console.error("Error fetching users:", error.message);
                }
            }
            else{
                try {
                    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                    const response = await fetch("/api/services", {
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
                        this.srvc_cats = data.data
                        console.log(this.srvc_cats)
                    }
                    else {
                        console.error("Failed to fetch :", data.message);
                    }
                }
                catch (error) {
                    console.error("Error fetching services:", error.message);
                }

            }
        },
        viewDetails(id){
            this.$router.push(`/profile/${id}`);
        },
        block(id){

        },
        redirect1(id){
            this.$router.push(`/prof_srvcs/${id}`);
        },
        redirect2(id){
            this.$router.push(`/prof_pendReqs/${id}`);
        }

    },
    mounted() {
        this.setup();
        this.fetchEntity();
    },
})

export default AdminDetails;