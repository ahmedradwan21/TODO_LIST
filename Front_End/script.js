// ===== الحالة =====
const state = {
	token: localStorage.getItem("token"),
	username: localStorage.getItem("username"),
	todos: [],
	projects: ["الكل"],
	filter: "all", // 'all' | 'active' | 'done'
	search: "",
	isDark: localStorage.getItem("theme") === "dark",
};

// ===== إعدادات API =====
const API_BASE = "http://localhost:5000/api";

function getHeaders() {
	return {
		"Content-Type": "application/json",
		Authorization: `Bearer ${state.token}`,
	};
}

// ===== الإشعارات =====
let notifyTimer = null;

function showNotification(msg, isError = false) {
	const el = document.getElementById("notification");
	if (!el) return;
	el.textContent = msg;
	el.style.background = isError ? "#e74c3c" : "#2ecc71";
	el.style.color = "#fff";
	el.style.display = "block";
	clearTimeout(notifyTimer);
	notifyTimer = setTimeout(
		() => {
			el.style.display = "none";
		},
		isError ? 4000 : 2500,
	);
}

// ===== المصادقة =====
const authBtn = document.getElementById("authBtn");
const authTitle = document.getElementById("authTitle");
const authUsername = document.getElementById("authUsername");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const switchAuth = document.getElementById("switchAuth");
let isLogin = true;

if (switchAuth) {
	switchAuth.addEventListener("click", (e) => {
		e.preventDefault();
		isLogin = !isLogin;
		authTitle.textContent = isLogin ? "تسجيل الدخول" : "إنشاء حساب";
		authUsername.style.display = isLogin ? "none" : "block";
		authBtn.textContent = isLogin ? "دخول" : "تسجيل";
		switchAuth.textContent = isLogin
			? "ليس لديك حساب؟ سجل الآن"
			: "لديك حساب؟ سجل دخول";
	});
}

if (authBtn) {
	authBtn.addEventListener("click", async () => {
		const endpoint = isLogin ? "login" : "register";

		if (!isLogin) {
			const usernameVal = authUsername.value.trim();
			if (!usernameVal || usernameVal.length < 3) {
				return showNotification("❌ اسم المستخدم 3 أحرف على الأقل", true);
			}
		}

		const emailVal = authEmail.value.trim();
		const passwordVal = authPassword.value.trim();

		if (!emailVal) return showNotification("❌ البريد الإلكتروني مطلوب", true);
		if (!passwordVal || passwordVal.length < 6)
			return showNotification("❌ كلمة المرور 6 أحرف على الأقل", true);

		const body = { email: emailVal, password: passwordVal };
		if (!isLogin) body.username = authUsername.value.trim();

		try {
			const res = await fetch(`${API_BASE}/auth/${endpoint}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || "حدث خطأ");
			}

			if (isLogin) {
				state.token = data.data.token;
				state.username = data.data.username;
				localStorage.setItem("token", state.token);
				localStorage.setItem("username", state.username);
				showNotification(`👋 مرحباً ${state.username}`);
				initApp();
			} else {
				showNotification("✅ تم التسجيل بنجاح، سجل دخول الآن");
				isLogin = true;
				switchAuth.click();
				authEmail.value = "";
				authPassword.value = "";
				authUsername.value = "";
			}
		} catch (err) {
			showNotification(err.message, true);
		}
	});
}

// ===== تسجيل الخروج =====
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
	logoutBtn.addEventListener("click", () => {
		localStorage.removeItem("token");
		localStorage.removeItem("username");
		state.token = null;
		state.username = null;
		showNotification("👋 تم تسجيل الخروج");
		location.reload();
	});
}

// ===== الثيم =====
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
	themeToggle.addEventListener("click", () => {
		state.isDark = !state.isDark;
		document.getElementById("app").className = state.isDark ? "dark" : "light";
		themeToggle.textContent = state.isDark ? "☀️" : "🌙";
		localStorage.setItem("theme", state.isDark ? "dark" : "light");
	});
}

// ===== التاريخ =====
const dateEl = document.getElementById("currentDate");
if (dateEl) {
	const now = new Date();
	dateEl.textContent = now.toLocaleDateString("ar-EG", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

// ===== جلب المهام =====
async function fetchTodos() {
	try {
		const params = new URLSearchParams();
		if (state.filters?.project && state.filters.project !== "الكل") {
			params.append("project", state.filters.project);
		}
		if (state.search) {
			params.append("search", state.search);
		}
		if (state.filter === "active") {
			params.append("done", "false");
		} else if (state.filter === "done") {
			params.append("done", "true");
		}

		const res = await fetch(`${API_BASE}/todos?${params}`, {
			headers: getHeaders(),
		});

		const data = await res.json();

		if (!res.ok) {
			throw new Error(data.message || "فشل جلب المهام");
		}

		state.todos = Array.isArray(data.data) ? data.data : [];
		renderTodos();
		updateStats();
	} catch (err) {
		showNotification(err.message, true);
		state.todos = [];
		renderTodos();
		updateStats();
	}
}

// ===== عرض المهام =====
function renderTodos() {
	const list = document.getElementById("todoList");
	if (!list) return;

	if (!state.todos || state.todos.length === 0) {
		list.innerHTML = `
            <li style="text-align:center; opacity:0.6; border-right-color: transparent; justify-content:center; list-style:none;">
                🎉 لا توجد مهام، أضف مهمة جديدة!
            </li>
        `;
		return;
	}

	list.innerHTML = state.todos
		.map((t) => {
			const dueDate = t.dueDate
				? new Date(t.dueDate).toLocaleDateString("ar-EG")
				: "";
			const priorityClass =
				t.priority === "عالية"
					? "priority-high"
					: t.priority === "متوسطة"
						? "priority-medium"
						: "priority-low";

			return `
                <li class="${t.done ? "done" : ""} ${priorityClass}">
                    <span class="todo-text">${t.text}</span>
                    <span class="todo-meta">
                        <span>📁 ${t.project || "عام"}</span>
                        ${dueDate ? `<span>📅 ${dueDate}</span>` : ""}
                        <span>🏷️ ${t.priority}</span>
                    </span>
                    <span class="todo-actions">
                        <button onclick="toggleTodo('${t._id}')">
                            ${t.done ? "↩️" : "✔️"}
                        </button>
                        <button onclick="deleteTodo('${t._id}')">🗑️</button>
                    </span>
                </li>
            `;
		})
		.join("");
}

// ===== تحديث الإحصائيات =====
function updateStats() {
	const total = state.todos.length;
	const done = state.todos.filter((t) => t.done).length;
	const pending = total - done;
	document.getElementById("totalCount").textContent = total;
	document.getElementById("doneCount").textContent = done;
	document.getElementById("pendingCount").textContent = pending;
}

// ===== إضافة مهمة =====
const addBtn = document.getElementById("addBtn");
if (addBtn) {
	addBtn.addEventListener("click", async () => {
		const textInput = document.getElementById("todoText");
		const text = textInput ? textInput.value.trim() : "";
		if (!text) {
			return showNotification("❌ اكتب المهمة أولاً", true);
		}

		const todoData = {
			text,
			project: document.getElementById("todoProject").value.trim() || "عام",
			dueDate: document.getElementById("todoDueDate").value || undefined,
			priority: document.getElementById("todoPriority").value,
		};

		try {
			const res = await fetch(`${API_BASE}/todos`, {
				method: "POST",
				headers: getHeaders(),
				body: JSON.stringify(todoData),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || "فشل الإضافة");
			}

			showNotification("✅ تمت الإضافة");
			if (textInput) textInput.value = "";
			document.getElementById("todoProject").value = "";
			document.getElementById("todoDueDate").value = "";

			await fetchTodos();
		} catch (err) {
			showNotification(err.message, true);
		}
	});
}

// ===== تغيير حالة المهمة =====
window.toggleTodo = async (id) => {
	try {
		const todo = state.todos.find((t) => t._id === id);
		if (!todo) return;

		const res = await fetch(`${API_BASE}/todos/${id}`, {
			method: "PUT",
			headers: getHeaders(),
			body: JSON.stringify({ done: !todo.done }),
		});

		const data = await res.json();

		if (!res.ok) {
			throw new Error(data.message || "فشل التحديث");
		}

		showNotification(todo.done ? "↩️ تم إعادة المهمة" : "✅ تم الإنجاز");
		await fetchTodos();
	} catch (err) {
		showNotification(err.message, true);
	}
};

// ===== حذف مهمة =====
window.deleteTodo = async (id) => {
	if (!confirm("هل أنت متأكد من حذف هذه المهمة؟")) return;

	try {
		const res = await fetch(`${API_BASE}/todos/${id}`, {
			method: "DELETE",
			headers: getHeaders(),
		});

		const data = await res.json();

		if (!res.ok) {
			throw new Error(data.message || "فشل الحذف");
		}

		showNotification("🗑️ تم الحذف");
		await fetchTodos();
	} catch (err) {
		showNotification(err.message, true);
	}
};

// ===== الفلاتر =====
const filterBtns = document.querySelectorAll(".filter-btn");
filterBtns.forEach((btn) => {
	btn.addEventListener("click", () => {
		filterBtns.forEach((b) => b.classList.remove("active"));
		btn.classList.add("active");
		state.filter = btn.dataset.filter;
		fetchTodos();
	});
});

// ===== البحث =====
const searchInput = document.getElementById("searchInput");
if (searchInput) {
	searchInput.addEventListener("input", (e) => {
		state.search = e.target.value;
		fetchTodos();
	});
}

// ===== تهيئة التطبيق =====
async function initApp() {
	const authScreen = document.getElementById("authScreen");
	const todoScreen = document.getElementById("todoScreen");
	const logoutBtn = document.getElementById("logoutBtn");

	if (authScreen) authScreen.style.display = "none";
	if (todoScreen) todoScreen.style.display = "block";
	if (logoutBtn) logoutBtn.style.display = "block";
	if (authBtn) authBtn.textContent = `👋 ${state.username}`;

	const app = document.getElementById("app");
	if (app) app.className = state.isDark ? "dark" : "light";
	if (themeToggle) themeToggle.textContent = state.isDark ? "☀️" : "🌙";

	await fetchTodos();
}

// ===== بدء التشغيل =====
if (state.token) {
	initApp();
} else {
	const authScreen = document.getElementById("authScreen");
	const todoScreen = document.getElementById("todoScreen");
	if (authScreen) authScreen.style.display = "flex";
	if (todoScreen) todoScreen.style.display = "none";
}

