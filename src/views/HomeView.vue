<template>
  <div class="container mx-auto bg-slate-800 min-h-screen h-full shadow shadow-black p-5 w-full sm:w-3/4 md:w-1/2 z-50 relative">
    <h1 class="space-header text-center mb-6 text-xl font-extrabold leading-none tracking-tight text-gray-900 lg:text-3xl dark:text-white">Space Todos</h1>
    <div class="flex items-center justify-between mb-4 flex-wrap space-y-2">
      <div class="w-full">
        <label for="nameTodo" class="text-white">Name</label>
        <input type="text" placeholder="Suggest something cool" v-model="cTodo.name" class="p-2 border border-gray-400 rounded w-full" />
      </div>
      <div>
        <label for="priorityTodo" class="text-white">Priority</label>
        <input type="number" placeholder="From 1 to 10" max="10" min="1" v-model="cTodo.priority" class="p-2 border w-full border-gray-400 rounded" />
      </div>
      <div class="">
        <button
          type="button"
          @click="addBtnHandler"
          :disabled="loading"
          class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-base px-3 py-2 text-center mt-3"
          :class="{ 'opacity-50 cursor-not-allowed': loading }"
        >
          Add todo
        </button>
      </div>
    </div>
    <hr class="my-4 border-gray-900" />
    <div v-if="firstVisit && loading" class="flex justify-center">
      <Loader></Loader>
    </div>
    <div v-else class="relative overflow-x-auto sm:rounded-lg">
      <table v-if="todos.length !== 0" class="w-full text-sm text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <th class="px-6 py-3 text-left">Name</th>
          <th class="px-6 py-3 text-center">Priority</th>
          <th class="px-6 py-3 text-center">Completed</th>
          <th class="px-6 py-3 text-center">Delete</th>
        </thead>
        <tbody>
          <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600" v-for="todo in todos" :key="todo.id + todo.name">
            <td v-html="todo.name" class="px-6 py-3"></td>
            <td v-html="todo.priority" class="px-6 py-3 text-center"></td>
            <td class="px-6 py-3 text-center">
              <SuccessTick v-if="todo.is_completed"></SuccessTick>
              <CompleteBtn v-else @click="completeTask(todo.id)"></CompleteBtn>
            </td>
            <td class="px-6 py-3 text-center">
              <button
                @click="todoBtnDeleteHandler(todo.id)"
                :disabled="loading"
                :class="{ 'opacity-50 cursor-not-allowed': loading }"
                class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-xs px-3 py-2 text-center"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="text-white text-center">Todos not found</div>
    </div>
  </div>
</template>
<script>
import dirtyWordsJSON from "../assets/dirtywords.json"
import CompleteBtn from "../components/CompleteBtn.vue"
import Loader from "../components/Loader.vue"
import SuccessTick from "../components/SuccessTick.vue"
import { toast } from "vue3-toastify"
const apiKey = import.meta.env.VITE_API_KEY
const apiUrl = import.meta.env.VITE_API_URL

export default {
  components: { Loader, CompleteBtn, SuccessTick },
  data() {
    return {
      todos: [],
      loading: false,
      firstVisit: true,
      cTodo: {
        name: "",
        priority: 1,
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
    this.fetchTodosBtnHandler()
  },
  methods: {
    hasDirtyWord() {
      const words = this.cTodo.name.toLowerCase().split(" ")
      for (const word of words) {
        if (this.dirtyWords.includes(word)) {
          return true
        }
      }
      return false
    },
    validateForm() {
      const errors = []

      if (this.cTodo.name.length === 0) {
        errors.push("Todo name is required.")
      }

      if (this.cTodo.name.split(" ").length < 3) {
        errors.push("Todo name have at least 3 words.")
      }

      if (this.hasDirtyWord()) {
        errors.push("Todo name contains censored words.")
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
          "X-API-KEY": apiKey,
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
        fD.append("name", this.cTodo.name)
        fD.append("priority", this.cTodo.priority)

        const data = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "X-API-KEY": apiKey,
          },
          body: fD,
        })
        const jsoned = await data.json()
        this.fetchTodos()
        this.loading = false
        this.notify(jsoned.message ?? jsoned.errors)
      }
    },
    async completeTask(id) {
      this.loading = true
      const payload = JSON.stringify({ is_completed: true })
      const data = await fetch(apiUrl + id, {
        method: "PATCH",
        headers: {
          "X-API-KEY": apiKey,
        },
        body: payload,
      })
      const jsoned = await data.json()
      this.fetchTodos()
      this.loading = false
      this.notify(jsoned.message ?? jsoned.errors)
    },
    async fetchTodos() {
      try {
        const data = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "X-API-KEY": apiKey,
          },
        })
        if (!data.ok) {
          throw new Error(`Request failed with status ${data.status}`)
        }

        const jsoned = await data.json()
        if (jsoned.length > 0) {
          this.todos = jsoned.sort((a, b) => a.priority - b.priority)
        }
      } catch (error) {
        this.notify(error + " check your API", 5500)
      }
    },
  },
  computed: {
    cNameIsEmpty() {
      return this.cTodo.name.length === 0
    },
  },
}
</script>
