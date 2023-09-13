<template>
  <div class="container mx-auto bg-slate-900 min-h-screen h-full shadow shadow-black p-5 w-full md:w-11/12 z-50 relative opacity-95">
    <h1 class="space-header text-center mb-6 font-extrabold leading-none tracking-tight text-gray-900 text-base lg:text-3xl dark:text-white">Space Gallery</h1>
    <div v-if="this.apikey === null" class="mb-5 space-y-3">
      <label for="apiKey" class="text-white mr-0 sm:mr-3 text-base sm:text-xl">Type your api key please</label>
      <input type="text" class="min-w-0 w-full max-w-sm px-2 py-1 rounded-md border focus:outline-none focus:ring focus:border-blue-300 transition duration-300" id="apiKeyInput" />
      <button class="bg-green-900 ml-3 hover:bg-green-700 text-white font-bold px-0 py-1 sm:px-2 rounded text-xs sm:text-sm" @click="addCookieBtnHandler">Attach your api key</button>
      <p class="text-gray-500 text-base italic break-all">
        If you don't have one, please send email to <a class="text-blue-500" href="mailto:serhio.gilev@gmail.com">serhio.gilev@gmail.com</a> or telegram:
        <a href="https://t.me/wwnp0" class="text-blue-500">https://t.me/wwnp0</a>
      </p>
    </div>
    <div v-else>
      <span class="text-white text-sm whitespace-normal truncate">Your api key: {{ this.apikey.substr(0, 4) + "......" + this.apikey.substr(-4, this.apikey.length - 1) }}</span>
      <div class="pb-5">
        <button @click="removeCookieBtnHandler" class="bg-red-800 hover:bg-red-900 text-white font-bold py-1 px-2 rounded text-xs">Remove Api Key</button>
      </div>
    </div>

    <div v-if="this.apikey">
      <div class="flex items-center justify-between mb-4 flex-wrap space-y-2">
        <div class="w-full">
          <label for="titleTodo" class="text-white">Title</label>
          <input type="text" placeholder="Suggest something cool" v-model="cImage.title" class="p-2 border border-gray-400 rounded block min-w-0 w-full max-w-sm" />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="file_input">Upload file</label>
          <input
            @change="handleFileChange"
            ref="fileInput"
            class="block min-w-0 w-full max-w-sm text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-500 focus:outline-none dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-700"
            aria-describedby="file_input_help"
            id="file_input"
            type="file"
          />
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">PNG, JPG - MAX 1MB.</p>
        </div>
        <div class="">
          <button
            type="button"
            @click="addBtnHandler"
            :disabled="loading"
            class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-base px-3 py-2 text-center mt-3"
            :class="{ 'opacity-50 cursor-not-allowed': loading }"
          >
            Add picture
          </button>
        </div>
      </div>
      <hr class="my-4 border-gray-900" />
      <div v-if="firstVisit && loading" class="flex justify-center">
        <Loader></Loader>
      </div>
      <div v-else>
        <masonry :cols="{ default: 5, 1000: 4, 700: 3, 400: 1 }" :gutter="{ default: '0', 700: '0' }">
          <div v-for="(item, index) in this.todos" :key="index">
            <div class="relative group">
              <img :src="item.url" :alt="item.title" />
              <div class="hidden group-hover:block absolute top-0 h-100 justify-end h-full w-full hover:bg-slate-900 hover:bg-opacity-40 transition-all">
                <div class="flex flex-col justify-end items-center h-full w-full p-5">
                  <p class="text-white mb-2">{{ item.title }}</p>
                  <button
                    @click="deleteBtnHandler(item.id)"
                    type="button"
                    class="text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-xs px-2 py-1 text-center"
                    :class="{ 'opacity-50 cursor-not-allowed': loading }"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </masonry>
      </div>
    </div>
  </div>
</template>
<script>
import dirtyWordsJSON from "../assets/dirtywords.json"
import CompleteBtn from "../components/CompleteBtn.vue"
import Loader from "../components/Loader.vue"
import SuccessTick from "../components/SuccessTick.vue"
import { toast } from "vue3-toastify"
import Cookies from "js-cookie"
const apiUrl = import.meta.env.VITE_API_URL

export default {
  components: { Loader, CompleteBtn, SuccessTick },
  data() {
    return {
      apikey: Cookies.get("apikey") ?? null,
      todos: [],
      loading: false,
      firstVisit: true,
      cImage: {
        title: "",
        image: null,
      },
      errors: [],
      dirtyWords: dirtyWordsJSON.RECORDS.map((record) => record.word),
    }
  },
  setup() {
    const notify = (msg, timeClose = 2500) => {
      toast(msg, {
        autoClose: timeClose,
        theme: "dark",
      })
    }
    return { notify }
  },
  mounted() {
    if (this.apikey !== null) {
      if (this.validateApiKey) {
        this.fetchTodosBtnHandler()
      } else {
        this.notify("Invalid Api key")
      }
    }
  },
  methods: {
    clearFileInput() {
      this.$refs.fileInput.value = ""
      this.cImage.image = null
    },
    handleFileChange(event) {
      this.cImage.image = event.target.files[0]
    },
    addCookieBtnHandler(value) {
      const apiKeyInput = document.querySelector("#apiKeyInput")
      const val = apiKeyInput.value
      if (val.length !== 32) {
        this.notify("Invalid api key")
        return
      }
      Cookies.set("apikey", val)
      this.apikey = val

      this.fetchTodosBtnHandler()
    },
    removeCookieBtnHandler() {
      this.apikey = null
      Cookies.remove("apikey")
    },
    handleFileChange(event) {
      const selectedFile = event.target.files[0]
      this.cImage.image = selectedFile
    },
    async deleteBtnHandler(id) {
      this.loading = true
      const data = await fetch(apiUrl + id, {
        method: "DELETE",
        headers: {
          "X-API-KEY": this.apikey,
        },
      })
      const jsoned = await data.json()
      this.fetchTodos()
      this.loading = false
      this.notify(jsoned.message ?? jsoned.errors)
    },
    hasDirtyWord() {
      const words = this.cImage.title.toLowerCase().split(" ")
      for (const word of words) {
        if (this.dirtyWords.includes(word)) {
          return true
        }
      }
      return false
    },
    validateForm() {
      const errors = []

      if (this.cImage.image !== null) {
        const imageType = this.cImage.image.type.split("/")[1]
        const imageSize = this.cImage.image.size
        console.log(imageSize)
        console.log(imageType)
        if (imageType !== "png" && imageType !== "jpeg") {
          errors.push("Image type should be:  png or jpg")
        }
        if (imageSize > 1024000) {
          errors.push("Image size should be less than 1 MB")
        }
      } else {
        errors.push("Add image please")
      }

      if (this.cImage.title.length === 0) {
        errors.push("Image title is required.")
      }

      if (this.hasDirtyWord()) {
        errors.push("Image title contains censored words.")
      }

      if (errors.length > 0) {
        this.notify(errors.join("\n\n"))
        return false
      }

      return true
    },
    async fetchTodosBtnHandler() {
      this.loading = true
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve()
        }, 750)
      })
      if (this.firstVisit) {
        this.firstVisit = false
      }
      try {
        this.fetchTodos()
      } catch (error) {}
      this.loading = false
    },
    async todoBtnDeleteHandler(id) {
      this.loading = true
      const data = await fetch(apiUrl + id, {
        method: "DELETE",
        headers: {
          "X-API-KEY": this.apikey,
        },
      })
      const jsoned = await data.json()
      this.fetchTodos()
      this.loading = false
      this.notify(jsoned.message ?? jsoned.errors)
    },
    async addBtnHandler() {
      if (this.validateForm()) {
        this.loading = true
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve()
          }, 750)
        })

        const fD = new FormData()
        fD.append("title", this.cImage.title)
        fD.append("image", this.cImage.image)

        const data = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "X-API-KEY": this.apikey,
          },
          body: fD,
        })
        const jsoned = await data.json()
        this.fetchTodos()

        this.clearFileInput()
        this.cImage.title = ""

        this.loading = false
        this.notify(jsoned.message ?? jsoned.errors)
      }
    },

    async fetchTodos() {
      try {
        const data = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "X-API-KEY": this.apikey,
          },
        })
        if (!data.ok) {
          throw new Error(`Request failed with status ${data.status}`)
        }

        const jsoned = await data.json()
        this.todos = jsoned
      } catch (error) {
        this.notify("Something went wrong, please try later 😿", 5500)
      }
    },
  },
  computed: {
    validateApiKey() {
      return this.apikey.length === 32
    },
  },
}
</script>
