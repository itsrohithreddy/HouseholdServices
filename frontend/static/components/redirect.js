const Redirect = Vue.component("RedirectComponent", {
    template: `
    <div>
        <div class="status-container">
            <div v-if="status">
                <div class="icon success">✔️</div>
                <div>
                    <p>{{ message }}</p>
                </div>
            </div>
            <div v-else>
                <div class="icon failure">❌</div>
                <p>{{ message }}</p>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            message: "",
            status: false,
        };
    },
    methods: {
        setup() {
            // Set data from route parameters
            this.message = this.$route.params.message;
            this.status = this.$route.params.status === "true"; // Ensure status is boolean

            //  Redirect after 3 seconds
            setTimeout(() => {
                this.$router.push('/'); // Replace with your redirect URL
            }, 3000);
        },
    },
    mounted() {
        this.setup();
    },
});

export default Redirect;
