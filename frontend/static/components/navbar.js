const Navbar = Vue.component('NavbarComponent', {
    template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-info">
        <a class="navbar-brand" href="#"><i class="fa-brands fa-servicestack fa-2xl" style="color: #ffffff;"></i>HS</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav-collapse" aria-controls="nav-collapse" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="nav-collapse">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="#"><i class="fa fa-fw fa-home fa-lg" style="color: #ffffff;"></i> Home</a>
            </li>
            <!-- Uncomment these if needed -->
            <!-- <li class="nav-item"><a class="nav-link" href="#"><i class="fa-solid fa-user fa-lg" style="color: #ffffff;"></i> Profile</a></li> -->
            <!-- Uncomment these if needed -->
            <!-- <li class="nav-item"><a class="nav-link" href="#"><i class="fa-solid fa-user-tie fa-lg" style="color: #ffffff;"></i> Professional</a></li> -->
        </ul>
        <ul class="navbar-nav ms-auto">
            <li class="nav-item">
            <router-link class="nav-link" to="/search"><i class="fa fa-fw fa-search fa-lg" style="color: #ffffff;"></i> Search</router-link>
            </li>
            <li v-if="loggedIn === '1'" class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Menu
                </a>
                <ul v-if="role === 'prof'" class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                    <li><router-link class="dropdown-item" to="/prof_pendReqs">Service Requests</router-link></li>
                    <li><router-link class="dropdown-item" to="/prof_srvcs">Completed/Rejected Requests</router-link></li>
                </ul>
                <ul v-else-if="role !== 'prof' && prof_req === '0'" class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                    <li><router-link class="dropdown-item" to="/profregister">Opt Serving</router-link></li>
                </ul>
                <ul v-else class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                    <li><router-link class="dropdown-item" to="javascript:void(0);">Approval Pending</router-link></li>
                </ul>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    User
                </a>
                <ul class="dropdown-menu" aria-labelledby="userDropdown">
                    <li v-if="loggedIn === '1'">{{ username }}</li>
                    <li><router-link class="dropdown-item" to="/">Home</router-link></li>
                    <li v-if="loggedIn === '0'"><router-link class="dropdown-item" to="/signin">Sign In</router-link></li>
                    <li v-if="loggedIn === '0'"><router-link class="dropdown-item" to="/signup">Sign Up</router-link></li>
                    <li v-if="loggedIn === '1'"><router-link class="dropdown-item" to="/profile">Profile</router-link></li>
                    <li v-if="loggedIn === '1'"><router-link class="dropdown-item" to="/signout">Sign Out</router-link></li>
                </ul>
            </li>
        </ul>
    </div>
  </nav>`,
  data(){
    return {
        username: localStorage.getItem('username') || '',
        loggedIn: localStorage.getItem('loggedIn') || '',
        role: localStorage.getItem('role') || '',
        user_id: localStorage.getItem('user_id') || '',
        prof_req : localStorage.getItem('prof_req') || '0'
    }
  },
  created() {
    // Listen to the storage event
    // window.addEventListener('storage', this.updateFromLocalStorage);
    this.$root.$on('login-success', this.updateFromLocalStorage);
    // console.log("Nav",this.prof_req)
  },
  destroyed() {
    // Clean up the event listener when the component is destroyed
    // window.removeEventListener('storage', this.updateFromLocalStorage);
    this.$root.$off('login-success', this.updateFromLocalStorage);
  },
  methods: {
    updateFromLocalStorage() {
      // Update component data when localStorage changes
      this.username = localStorage.getItem('username') || '';
      this.loggedIn = localStorage.getItem('loggedIn') || '';
      this.role = localStorage.getItem('role') || '';
      this.user_id = localStorage.getItem('user_id') || '';
      this.prof_req = localStorage.getItem('prof_req') || '0'
    }
  }
});


export default Navbar;