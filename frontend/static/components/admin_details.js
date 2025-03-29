const AdminDetails = Vue.component("",{
    template:`
    <div id="AdminDetailsComponent-fullpage">
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
                        <button type="button" :id="'block_' + customer['user_id']" class="btn btn-outline-danger" @click="block(customer['user_id'])">
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


        <div v-if="entity === 'Blocked Users'">
            <h1 style="text-align: center;color: #333;">Blocked Users</h1>

            <div v-if="blckd_users && blckd_users.length > 0">
                <div 
                v-for="blckd_user in blckd_users" 
                :key="blckd_user['user_id']" 
                class="card my-2"
                >
                    <div class="card-header">
                        <h5><strong>Name:</strong> {{ blckd_user['user_fullname'] }}</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text"><strong>UserName(Email) : </strong> {{ blckd_user['user_username'] }}</p>
                        <p class="card-text"><strong>User Role:</strong> Blocked </p>
                        <button type="button" :id="'revoke_' + blckd_user['user_id']" class="btn btn-outline-danger" @click="revoke(blckd_user['user_id'])">
                            Revoke
                        </button>
                    </div>
                </div>    
            </div>

            <div v-else>
                <div class="card my-2">
                    <div class="card-header">
                        <h5 style="text-align: center;"><strong>No blocked users</strong></h5>
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
                        <button type="button" :id="'block_' + professional['user_id']" class="btn btn-outline-danger" @click="block(professional['user_id'])">
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
                        <h5><strong>Category : </strong> {{ srvc_cat['service_category'] }}</h5>
                        <button type="button" :id="'update_' + srvc_cat['service_id']" class="btn btn-outline-primary btn-md" @click="updateModalFunc(srvc_cat)">
                            Update
                        </button>
                    </div>
                    <div class="card-body">
                        <p class="card-text"><strong>Description : </strong> {{ srvc_cat['service_dscp'] }}</p>
                        <p class="card-text"><strong>Base Price : </strong> {{ srvc_cat['service_base_price'] }}</p>
                        <p class="card-text"><strong>Time Required(in days) : </strong> {{ srvc_cat['time_req'] }}</p>
                        <p class="card-text"><strong>Total professionals under this category : </strong> {{ srvc_cat['prof_count'] }}</p>
                        <p class="card-text"><strong>Total services under this category : </strong> {{ srvc_cat['srvc_count'] }}</p>
                        <p class="card-text"><strong>Services under this category : </strong> {{ srvc_cat['srvc_names'] }}</p>
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



        <div v-if="serviceCat_selected" id="myModal_Update" class="AdminDetailsComponent-modal modal" style="position:fixed;top:15%;left:30%;width: 50%;height : 70%;max-width:500px;">
            <div class="AdminDetailsComponent-modal-content modal-content" style="width: 100%">
            <span class="AdminDetailsComponent-close" @click="closeUpdateModal()">&times;</span>
            
            <div class="container mt-5 d-flex align-items-start justify-content-center">
                <div>
                <form class="form">
                    <div class="mb-3">
                        <div class="mb-3">
                            <label for="service_category" class="form-label">Service Category</label>
                            <input type="text" class="form-control" id="service_category" name="service_category" v-model="serviceCat_selected.service_category">
                        </div>
                        <div class="mb-3">
                            <label for="service_base_price" class="form-label">Price</label>
                            <input type="text" class="form-control" id="service_base_price" name="service_base_price" v-model="serviceCat_selected.service_base_price">
                        </div>
                        <div class="mb-3">
                            <label for="time_req" class="form-label">Minimum Time Required <span style="color:red"> * </span></label>
                            <input type="number" min="1" max="4" step="1" class="form-control" id="time_req" name="time_req" v-model="serviceCat_selected.time_req">
                        </div>
                        <div class="mb-3">
                            <label for="service_dscp" class="form-label">Service Description <span style="color:red"> * </span></label>
                            <textarea class="form-control" id="service_dscp" name="service_dscp" rows="3" v-model="serviceCat_selected.service_dscp"></textarea>
                        </div>
                    </div>
                    <button type="button"  class="btn btn-outline-primary btn-sm" @click="updateService()">Submit</button>
                </form>
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
            blckd_users : [],
            srvc_cats : [],
            serviceCat_selected: null
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
                            // console.log(this.customers)
                        }
                        else if(this.entity === 'Blocked Users'){
                            for (const x of data.data) {
                               
                                if(x.user_role === 'blckd'){
                                    this.blckd_users.push(x)
                                }
                            }
                            console.log(this.blckd_users)
                        }
                        else{
                            for (const x of data.data) {
                                
                                if(x.user_role === 'prof'){
                                    this.professionals.push(x)
                                }
                            }
                            // console.log(this.professionals)
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
        async block(id){
            const block_btn = document.getElementById(`block_${id}`);
            block_btn.disabled = true;
            block_btn.innerText = "Blocking...";
            // block_btn.classList.add('disabled');
            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                const response = await fetch(`/api/block_user`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        'X-CSRF-Token': csrfToken
                    },
                    body: JSON.stringify({'id': id})
                })

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Failed to block user:", errorData.message);
                    block_btn.disabled = false;
                    block_btn.innerText = "Block";
                    throw new Error(`HTTP Error: ${errorData.status} - ${errorData.status}`);
                }
                

                const data = await response.json();
                if(data.status === "success" && data.flag === 1){
                    block_btn.innerText = "Blocked";
                    // block_btn.classList.add('btn-danger');
                }
                else {
                    console.error(" Error blocking user : ", data.message);
                    block_btn.disabled = false;
                    block_btn.innerText = "Block";
                }
            }
            catch (error) {
                console.error("Error blocking user:", error);
                block_btn.disabled = false;
                block_btn.innerText = "Block";
            }
        },
        async revoke(id){
            const block_btn = document.getElementById(`revoke_${id}`);
            block_btn.disabled = true;
            block_btn.innerText = "Revoking...";
            // block_btn.classList.add('disabled');
            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                const response = await fetch(`/api/revoke_user`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        'X-CSRF-Token': csrfToken
                    },
                    body: JSON.stringify({'id': id})
                })

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Failed to revoke user:", errorData.message);
                    block_btn.disabled = false;
                    block_btn.innerText = "Revoke";
                    throw new Error(`HTTP Error: ${errorData.status} - ${errorData.status}`);
                }
                

                const data = await response.json();
                if(data.status === "success" && data.flag === 1){
                    block_btn.innerText = "Revoked";
                    // block_btn.classList.add('btn-danger');
                }
                else {
                    console.error(" Error blocking user : ", data.message);
                    block_btn.disabled = false;
                    block_btn.innerText = "Revoke";
                }
            }
            catch (error) {
                console.error("Error blocking user:", error);
                block_btn.disabled = false;
                block_btn.innerText = "Revoke";
            }
        },
        async updateService(){
            // block_btn.classList.add('disabled');
            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                const response = await fetch(`/api/services`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        'X-CSRF-Token': csrfToken
                    },
                    body: JSON.stringify({"service_id": this.serviceCat_selected['service_id'],"service_category": this.serviceCat_selected['service_category'],"service_base_price": this.serviceCat_selected['service_base_price'],"time_req": this.serviceCat_selected['time_req'],"service_dscp": this.serviceCat_selected['service_dscp']})
                })

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Failed to update service category.", errorData.message);
                    throw new Error(`HTTP Error: ${errorData.status} - ${errorData.status}`);
                    
                }
                

                const data = await response.json();
                if(data.status === "success" && data.flag === 1){
                    console.log("Service Category updated successfully.", data.message);
                    this.closeUpdateModal();
                }
                else {
                    console.error(" Error updating service category : ", data.message);
                    this.closeUpdateModal();
                }
            }
            catch (error) {
                console.error("Error updating service category:", error);
                this.closeUpdateModal();
            }
        },
        updateModalFunc(srvc_cat){
            // console.log(srvc_cat)
            this.serviceCat_selected = srvc_cat;
            // console.log("Defined : ",this.serviceCat_selected)
            this.$nextTick(() => {
                const modal = document.getElementById('myModal_Update');
                if (modal) {
                    modal.style.display = 'block';
                } else {
                    console.error("Modal not found in DOM");
                }
            });
            // document.getElementById('myModal_Rate').style.display = 'block';
            // document.getElementById('servicereq_id').value = servicereq.srvcreq_id;
          },
    
    
        closeUpdateModal() {
            document.getElementById("myModal_Update").style.display = 'none'
            this.serviceCat_selected = null
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