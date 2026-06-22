<template>
  <div class="home-wrap">
    <!-- 顶栏 -->
    <div class="topbar">
      <div class="topbar-logo">
        <span class="logo-dot"></span>
        <span class="logo-text">越杰社区</span>
      </div>
      <div class="topbar-right">
        <span class="username">{{ profile.name || '用户' }}</span>
        <el-button size="small" @click="logout" plain>退出</el-button>
      </div>
    </div>

    <div class="main-content">
      <el-tabs v-model="activeTab" class="yuejie-tabs">

        <!-- ① 个人信息 -->
        <el-tab-pane label="个人信息" name="profile">
          <div class="card-block">
            <el-form :model="profile" label-width="110px" class="profile-form">

              <el-form-item label="个人头像">
                <div class="avatar-row">
                  <el-avatar :size="72" :src="fullUrl(profile.avatar_path)">{{ (profile.name||'?')[0] }}</el-avatar>
                  <div class="avatar-right">
                    <el-upload action="#" :before-upload="uploadAvatar" accept="image/jpeg,image/png" :show-file-list="false">
                      <el-button size="small" class="btn-outline">上传头像</el-button>
                    </el-upload>
                    <div class="field-hint">推荐真实生活照，仅 JPG/PNG，≤ 2MB</div>
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="我的身份">
                <el-radio-group v-model="profile.role">
                  <el-radio value="学子">我是越杰学子</el-radio>
                  <el-radio value="导师">我是越杰导师</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="姓名"><el-input v-model="profile.name" /></el-form-item>
                  <el-form-item label="当前身份">
                    <el-select v-model="profile.identity" placeholder="请选择" style="width:100%">
                      <el-option v-for="v in identities" :key="v" :label="v" :value="v" />
                    </el-select>
                  </el-form-item>
                  <el-form-item v-if="profile.identity === '其他'" label=" ">
                    <el-input v-model="profile.identity_other" placeholder="请填写当前职业" />
                  </el-form-item>
                  <el-form-item label="所属单位"><el-input v-model="profile.organization" /></el-form-item>
                  <el-form-item label="入学年份">
                    <el-input v-model="profile.enrollment_year" placeholder="如 2020（导师可填更早年份）" />
                  </el-form-item>
                  <el-form-item label="本科专业">
                    <el-select v-model="profile.undergrad_major" placeholder="请选择" style="width:100%">
                      <el-option v-for="v in majors" :key="v" :label="v" :value="v" />
                    </el-select>
                  </el-form-item>
                  <el-form-item v-if="profile.undergrad_major === '其他'" label=" ">
                    <el-input v-model="profile.undergrad_major_other" placeholder="请填写本科专业" />
                  </el-form-item>
                  <el-form-item label="籍贯">
                    <el-cascader v-model="hometownValue" :options="provinceCity"
                      :props="{ value: 'value', label: 'label', children: 'children' }"
                      placeholder="请选择省市" clearable style="width:100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="现居地">
                    <el-select v-model="residenceType" placeholder="请选择" style="width:100%" @change="onResidenceChange">
                      <el-option label="国内" value="domestic" />
                      <el-option label="海外" value="overseas" />
                    </el-select>
                  </el-form-item>
                  <el-form-item v-if="residenceType === 'domestic'" label=" ">
                    <el-cascader v-model="residenceValue" :options="provinceCity"
                      :props="{ value: 'value', label: 'label', children: 'children' }"
                      placeholder="请选择省市" clearable style="width:100%" />
                  </el-form-item>
                  <el-form-item v-if="residenceType === 'overseas'" label=" ">
                    <el-input v-model="profile.overseas_location" placeholder="如: New York City, NY, US" />
                  </el-form-item>
                  <el-form-item label="手机号码">
                    <el-input v-model="profile.phone" disabled />
                  </el-form-item>
                  <el-form-item label="邮箱地址"><el-input v-model="profile.email" /></el-form-item>
                  <el-form-item label="微信号"><el-input v-model="profile.wechat" /></el-form-item>
                  <el-form-item label="隐私设置">
                    <el-checkbox v-model="profile.phone_public" :true-value="1" :false-value="0">手机公开</el-checkbox>
                    <el-checkbox v-model="profile.email_public" :true-value="1" :false-value="0">邮箱公开</el-checkbox>
                    <el-checkbox v-model="profile.wechat_public" :true-value="1" :false-value="0">微信公开</el-checkbox>
                    <el-checkbox v-model="profile.use_privacy_shield" :true-value="1" :false-value="0">不公开，通过越杰邮箱联系我</el-checkbox>
                  </el-form-item>
                  <el-form-item label="个人简历">
                    <el-upload action="#" :before-upload="uploadResume" accept="application/pdf" :show-file-list="false">
                      <el-button size="small" class="btn-outline">上传简历（PDF，≤ 5MB）</el-button>
                    </el-upload>
                    <div v-if="profile.resume_path" class="field-hint" style="margin-top:6px">
                      <a :href="fullUrl(profile.resume_path)" target="_blank">📄 查看已上传简历</a>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="简要介绍">
                <el-input v-model="profile.intro_brief" :maxlength="100" show-word-limit type="textarea" :rows="2" />
              </el-form-item>
              <el-form-item label="详细介绍">
                <el-input v-model="profile.intro_detail" type="textarea" :rows="5"
                  :maxlength="3000" show-word-limit placeholder="请详细介绍自己（选填）" />
                <div class="field-hint">提示：内容超过3000字系统将自动生成附件展示（选填）</div>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- ② 我的标签 -->
        <el-tab-pane label="我的标签" name="tags">
          <div class="card-block">
            <div class="tag-header">
              <span class="section-title">全部标签 <small>（点击选中/取消）</small></span>
              <div class="new-tag-row">
                <el-input v-model="newTagName" placeholder="输入新标签名" size="small" style="width:160px" @keyup.enter="createTag" />
                <el-button size="small" class="btn-primary" @click="createTag">+ 添加</el-button>
              </div>
            </div>
            <div class="tag-cloud">
              <span v-for="tag in tags" :key="tag.id"
                :class="['tag-pill', tag.selected ? 'tag-pill--active' : '']"
                @click="toggleTag(tag)">
                {{ tag.name }}<span v-if="tag.highlight_order" class="highlight-badge"> ⭐{{ tag.highlight_order }}</span>
              </span>
            </div>
            <el-divider>高亮展示标签（最多3个）</el-divider>
            <div class="highlight-row">
              <div v-for="order in [1,2,3]" :key="order" class="highlight-slot">
                <span class="slot-label">⭐ 位置{{ order }}</span>
                <el-select :model-value="getHighlightTag(order)" placeholder="选择标签" clearable size="small"
                  @change="val => setHighlight(order, val)" style="width:150px">
                  <el-option v-for="tag in tags.filter(t => t.selected)" :key="tag.id" :label="tag.name" :value="tag.id" />
                </el-select>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- ③ 欢迎交流 -->
        <el-tab-pane label="欢迎交流" name="topics">
          <div class="card-block">
            <div class="topic-add">
              <el-select v-model="newTopicCategory" placeholder="选择话题类型" style="width:250px">
                <el-option value="前程互通" label="🚀 前程互通 | 互通行业近况、共探前路方向" />
                <el-option value="志趣相逢" label="🎯 志趣相逢 | 相聚业余所爱、结识同频校友" />
              </el-select>
              <el-input v-model="newTopic" placeholder="分享你的交流内容（25字以内）" :maxlength="25" style="flex:1" @keyup.enter="addTopic" />
              <el-button class="btn-primary" @click="addTopic">发布</el-button>
            </div>
            <div v-if="topics.length === 0" class="empty-tip">还没有交流内容，来添加第一条吧！</div>
            <div v-for="t in topics" :key="t.id" class="topic-card">
              <div class="topic-meta">
                <span :class="['topic-badge', t.category === '前程互通' ? 'topic-badge--blue' : 'topic-badge--green']" v-if="t.category">{{ t.category }}</span>
                <span class="topic-time">{{ formatDate(t.created_at) }}</span>
              </div>
              <div class="topic-content">{{ t.topic }}</div>
              <el-button link type="danger" size="small" @click="deleteTopic(t.id)">删除</el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- ④ 社区成员 -->
        <el-tab-pane label="社区成员" name="community">
          <div class="card-block">
            <el-input v-model="searchKeyword" placeholder="搜索姓名 / 单位 / 简介..." clearable style="max-width:360px;margin-bottom:20px" />
            <div v-if="filteredMembers.length === 0" class="empty-tip">暂无成员</div>
            <div class="member-grid">
              <div v-for="m in filteredMembers" :key="m.id" class="member-card" @click="openMember(m)">
                <el-avatar :size="56" :src="fullUrl(m.avatar_path)" class="member-avatar-img">{{ (m.name||'?')[0] }}</el-avatar>
                <div class="member-name">{{ m.name || '未填写' }}</div>
                <div class="member-meta">
                  <span class="role-badge" v-if="m.role === '导师'">导师</span>
                  <span class="identity-badge" v-if="m.identity">{{ m.identity }}</span>
                </div>
                <div class="member-org" v-if="m.organization">{{ m.organization }}</div>
                <div class="member-intro" v-if="m.intro_brief">{{ m.intro_brief }}</div>
                <div class="member-tags" v-if="m.highlight_tags">
                  <span v-for="(ht,i) in m.highlight_tags.split(',')" :key="i" class="tag-pill tag-pill--active tag-pill--sm">⭐ {{ ht }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

      </el-tabs>

      <!-- 全局保存按钮 -->
      <div class="global-save-bar">
        <button class="save-btn" @click="saveProfile" :disabled="savingProfile">
          {{ savingProfile ? '保存中…' : '保存个人信息' }}
        </button>
      </div>
    </div>

    <!-- 成员详情弹窗 -->
    <el-dialog v-model="memberDialogVisible" :title="null" width="760px" top="4vh" class="member-dialog">
      <div v-if="selectedMember" class="dialog-body">
        <!-- 左栏 -->
        <div class="dlg-left">
          <div class="dlg-banner"></div>
          <div class="dlg-avatar-wrap">
            <el-avatar :size="84" :src="fullUrl(selectedMember.avatar_path)" class="dlg-avatar">
              {{ (selectedMember.name||'?')[0] }}
            </el-avatar>
          </div>
          <div class="dlg-name">{{ selectedMember.name }}</div>
          <div class="dlg-badges">
            <span class="role-badge" v-if="selectedMember.role === '导师'">导师</span>
            <span class="identity-badge" v-if="selectedMember.identity">{{ selectedMember.identity }}</span>
          </div>
          <div class="dlg-org" v-if="selectedMember.organization">{{ selectedMember.organization }}</div>
          <div class="dlg-location" v-if="selectedMember.overseas_location || selectedMember.province">
            📍 {{ selectedMember.overseas_location || [selectedMember.province, selectedMember.city].filter(Boolean).join(' ') }}
          </div>
          <div class="dlg-contacts">
            <div v-if="selectedMember.use_privacy_shield" class="privacy-shield-tip">该成员已开启隐私保护，请通过越杰邮箱联系。</div>
            <template v-else>
              <div v-if="selectedMember.phone_public && selectedMember.phone">📱 {{ selectedMember.phone }}</div>
              <div v-if="selectedMember.email_public && selectedMember.email">✉️ {{ selectedMember.email }}</div>
              <div v-if="selectedMember.wechat_public && selectedMember.wechat">💬 {{ selectedMember.wechat }}</div>
            </template>
          </div>
          <a v-if="selectedMember.resume_path" :href="fullUrl(selectedMember.resume_path)" target="_blank" class="resume-btn">
            📄 查看 / 下载简历
          </a>
        </div>

        <!-- 右栏 -->
        <div class="dlg-right">
          <!-- 高亮标签 -->
          <div class="dlg-block" v-if="selectedMember.highlight_tags">
            <div class="dlg-block-title">🏷️ 个人标签</div>
            <div class="dlg-tags">
              <span v-for="(ht,i) in selectedMember.highlight_tags.split(',')" :key="i" class="tag-pill tag-pill--active">⭐ {{ ht }}</span>
            </div>
          </div>

          <!-- 交流话题（从 selectedTopics 异步加载） -->
          <div class="dlg-block" v-if="selectedTopics.length">
            <div class="dlg-block-title">💬 欢迎找我聊这些</div>
            <div v-for="t in selectedTopics" :key="t.id" class="dlg-topic-row">
              <span :class="['topic-badge', t.category === '前程互通' ? 'topic-badge--blue' : 'topic-badge--green']">{{ t.category }}</span>
              <span class="dlg-topic-text">{{ t.topic }}</span>
            </div>
          </div>

          <!-- 详细介绍 -->
          <div class="dlg-block" v-if="selectedMember.intro_detail">
            <div class="dlg-block-title">📝 详细介绍</div>
            <div class="dlg-intro-quote">{{ selectedMember.intro_detail }}</div>
          </div>
          <div class="dlg-block" v-else-if="selectedMember.intro_brief">
            <div class="dlg-block-title">📝 个人简介</div>
            <div class="dlg-intro-quote">{{ selectedMember.intro_brief }}</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import http from '../api'
import { provinceAndCityData } from 'element-china-area-data'

const BASE = 'http://localhost:3000'
const fullUrl = path => path ? BASE + path : ''

const router = useRouter()
const activeTab = ref('profile')
const identities = ['本科生', '硕士生', '博士生', '其他']
const majors = ['计算机', '自动化', '能动', '电气', '材料', '机械', '力学', '其他']
const provinceCity = provinceAndCityData

// -------- 个人信息 --------
const profile = reactive({})
const savingProfile = ref(false)
const hometownValue = ref([])
const residenceType = ref('')
const residenceValue = ref([])

async function loadProfile() {
  const { data } = await http.get('/users/me')
  Object.assign(profile, data)
  if (data.hometown_province) hometownValue.value = [data.hometown_province, data.hometown_city].filter(Boolean)
  if (data.overseas_location) residenceType.value = 'overseas'
  else if (data.province) { residenceType.value = 'domestic'; residenceValue.value = [data.province, data.city].filter(Boolean) }
}

function onResidenceChange(val) {
  if (val === 'domestic') profile.overseas_location = ''
  else residenceValue.value = []
}

async function saveProfile() {
  savingProfile.value = true
  const [hp, hc] = hometownValue.value
  const [province, city] = residenceType.value === 'domestic' ? residenceValue.value : []
  try {
    await http.put('/users/me', { ...profile, hometown_province: hp||null, hometown_city: hc||null, province: province||null, city: city||null })
    ElMessage.success('保存成功')
    await loadMembers()
  } catch (err) {
    ElMessage.error(err.response?.data?.message || '保存失败')
  } finally {
    savingProfile.value = false
  }
}

async function uploadAvatar(file) {
  if (!['image/jpeg','image/png'].includes(file.type)) { ElMessage.error('头像只支持 JPG/PNG 格式'); return false }
  if (file.size > 2 * 1024 * 1024) { ElMessage.error('头像文件不能超过 2MB'); return false }
  const fd = new FormData(); fd.append('avatar', file)
  try {
    const { data } = await http.post('/users/me/avatar', fd)
    profile.avatar_path = data.avatar_path
    ElMessage.success('头像上传成功')
  } catch (err) { ElMessage.error(err.response?.data?.message || '上传失败') }
  return false
}

async function uploadResume(file) {
  if (file.type !== 'application/pdf') { ElMessage.error('简历只支持 PDF 格式'); return false }
  if (file.size > 5 * 1024 * 1024) { ElMessage.error('简历文件不能超过 5MB'); return false }
  const fd = new FormData(); fd.append('resume', file)
  try {
    const { data } = await http.post('/users/me/resume', fd)
    profile.resume_path = data.resume_path
    ElMessage.success('简历上传成功')
  } catch (err) { ElMessage.error(err.response?.data?.message || '上传失败') }
  return false
}

// -------- 标签 --------
const tags = ref([])
const newTagName = ref('')

async function loadTags() {
  const { data } = await http.get('/tags')
  tags.value = data
}

async function toggleTag(tag) {
  const { data } = await http.post('/tags/toggle', { tagId: tag.id })
  tag.selected = data.action === 'added'
  if (!tag.selected) tag.highlight_order = null
}

async function createTag() {
  const name = newTagName.value.trim()
  if (!name) return
  await http.post('/tags', { name })
  newTagName.value = ''
  await loadTags()
}

function getHighlightTag(order) {
  return tags.value.find(t => t.highlight_order === order)?.id ?? null
}

async function setHighlight(order, tagId) {
  const old = tags.value.find(t => t.highlight_order === order)
  if (old) old.highlight_order = null
  if (!tagId) { if (old) await http.post('/tags/highlight', { tagId: old.id, order: null }); return }
  await http.post('/tags/highlight', { tagId, order })
  const tag = tags.value.find(t => t.id === tagId)
  if (tag) tag.highlight_order = order
}

// -------- 交流话题 --------
const topics = ref([])
const newTopic = ref('')
const newTopicCategory = ref('')

async function loadTopics() {
  const { data } = await http.get('/topics')
  topics.value = data
}

async function addTopic() {
  if (!newTopic.value.trim()) return ElMessage.warning('内容不能为空')
  await http.post('/topics', { topic: newTopic.value.trim(), category: newTopicCategory.value || null })
  newTopic.value = ''
  await loadTopics()
}

async function deleteTopic(id) {
  await http.delete(`/topics/${id}`)
  topics.value = topics.value.filter(t => t.id !== id)
}

// -------- 社区成员 --------
const members = ref([])
const searchKeyword = ref('')
const memberDialogVisible = ref(false)
const selectedMember = ref(null)
const selectedTopics = ref([])

const filteredMembers = computed(() => {
  const kw = searchKeyword.value.toLowerCase()
  if (!kw) return members.value
  return members.value.filter(m => [m.name, m.organization, m.intro_brief].some(v => v?.toLowerCase().includes(kw)))
})

async function loadMembers() {
  const { data } = await http.get('/users')
  members.value = data
}

async function openMember(m) {
  selectedMember.value = m
  selectedTopics.value = []
  memberDialogVisible.value = true
  // 拉取该成员的交流话题（复用 /topics 接口但需要后端支持 userId 参数）
  try {
    const { data } = await http.get(`/topics/user/${m.id}`)
    selectedTopics.value = data
  } catch { /* 无话题时静默 */ }
}

function formatDate(ts) {
  return ts ? new Date(ts).toLocaleDateString('zh-CN') : ''
}

function logout() {
  localStorage.clear()
  router.push('/auth')
}

onMounted(() => {
  loadProfile()
  loadTags()
  loadTopics()
  loadMembers()
})
</script>

<style scoped>
/* ===== 品牌变量 ===== */
:root { --brand: #8679FB; --dark: #344054; }

.home-wrap { min-height: 100vh; background: #F8F9FA; }

/* 顶栏 */
.topbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 32px; height: 58px; background: #fff;
  box-shadow: 0 1px 0 #EAECF0;
}
.topbar-logo { display: flex; align-items: center; gap: 8px; }
.logo-dot { width: 10px; height: 10px; border-radius: 50%; background: #8679FB; }
.logo-text { font-size: 16px; font-weight: 700; color: #344054; }
.topbar-right { display: flex; align-items: center; gap: 12px; }
.username { font-size: 14px; color: #667085; }

.main-content { max-width: 1100px; margin: 28px auto; padding: 0 20px; }

/* Tab 主题覆盖 */
:deep(.yuejie-tabs .el-tabs__item.is-active) { color: #8679FB; }
:deep(.yuejie-tabs .el-tabs__active-bar) { background: #8679FB; }
:deep(.yuejie-tabs .el-tabs__item:hover) { color: #8679FB; }
:deep(.yuejie-tabs .el-tabs__header) { margin-bottom: 0; }

/* 卡片容器 */
.card-block {
  background: #fff; border-radius: 12px;
  padding: 28px 32px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
}

.profile-form { max-width: 920px; margin-top: 4px; }
.avatar-row { display: flex; align-items: center; gap: 16px; }
.avatar-right { display: flex; flex-direction: column; gap: 6px; }
.field-hint { font-size: 12px; color: #9099A6; margin-top: 2px; }
.field-hint a { color: #8679FB; }

/* 按钮 */
.btn-primary {
  background: #8679FB; border: none; color: #fff;
  border-radius: 8px; padding: 7px 16px; cursor: pointer; font-size: 13px;
}
.btn-primary:hover { background: #7468e8; }
.btn-outline {
  border: 1px solid #8679FB; color: #8679FB; background: transparent;
  border-radius: 8px;
}

/* 标签 */
.tag-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-title { font-size: 15px; font-weight: 600; color: #344054; }
.new-tag-row { display: flex; gap: 8px; }
.tag-cloud { display: flex; flex-wrap: wrap; gap: 8px; padding: 16px; background: #F8F9FA; border-radius: 10px; min-height: 72px; }
.tag-pill {
  display: inline-flex; align-items: center; padding: 4px 12px;
  border-radius: 20px; font-size: 13px; cursor: pointer;
  border: 1.5px solid #D0D5DD; color: #667085; background: #fff;
  transition: all .15s;
}
.tag-pill--active { background: #8679FB; border-color: #8679FB; color: #fff; }
.tag-pill--sm { padding: 2px 9px; font-size: 12px; }
.highlight-badge { font-size: 11px; }
.highlight-row { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 8px; }
.highlight-slot { display: flex; align-items: center; gap: 8px; }
.slot-label { white-space: nowrap; font-size: 13px; }

/* 话题 */
.topic-add { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
.topic-card { padding: 14px 16px; background: #F8F9FA; border-radius: 10px; margin-bottom: 10px; }
.topic-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.topic-time { color: #9099A6; font-size: 12px; }
.topic-content { font-size: 14px; color: #344054; margin-bottom: 6px; line-height: 1.6; }
.topic-badge { display: inline-flex; align-items: center; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.topic-badge--blue { background: #EEF4FF; color: #3538CD; }
.topic-badge--green { background: #ECFDF3; color: #027A48; }

/* 成员列表 */
.member-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 16px; }
.member-card {
  background: #fff; border-radius: 12px; padding: 20px 16px 16px;
  text-align: center; cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  transition: box-shadow .2s, transform .2s;
}
.member-card:hover { box-shadow: 0 6px 24px rgba(134,121,251,0.15); transform: translateY(-2px); }
.member-avatar-img { margin-bottom: 10px; }
.member-name { font-size: 15px; font-weight: 700; color: #344054; margin-bottom: 6px; }
.member-meta { display: flex; justify-content: center; gap: 6px; flex-wrap: wrap; margin-bottom: 6px; }
.role-badge { background: #FFF4ED; color: #C4320A; border-radius: 20px; padding: 2px 10px; font-size: 12px; font-weight: 500; }
.identity-badge { background: #F0F0FF; color: #8679FB; border-radius: 20px; padding: 2px 10px; font-size: 12px; }
.member-org { font-size: 12px; color: #9099A6; margin-bottom: 4px; }
.member-intro { font-size: 12px; color: #667085; line-height: 1.5; margin: 4px 0 8px; }
.member-tags { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px; }

/* 全局保存 */
.global-save-bar { display: flex; justify-content: center; padding: 24px 0 40px; }
.save-btn {
  background: #8679FB; color: #fff; border: none; border-radius: 10px;
  padding: 12px 48px; font-size: 15px; font-weight: 600; cursor: pointer;
  box-shadow: 0 4px 16px rgba(134,121,251,0.35);
  transition: background .15s;
}
.save-btn:hover { background: #7468e8; }
.save-btn:disabled { opacity: .6; cursor: not-allowed; }

/* 弹窗 */
:deep(.member-dialog .el-dialog__header) { padding: 0; }
:deep(.member-dialog .el-dialog__body) { padding: 0; overflow: hidden; border-radius: 12px; }

.dialog-body { display: flex; min-height: 480px; }

/* 左栏 */
.dlg-left {
  width: 240px; flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center;
  background: #fff; padding-bottom: 28px;
}
.dlg-banner { width: 100%; height: 88px; background: #344054; border-radius: 12px 0 0 0; }
.dlg-avatar-wrap { margin-top: -42px; }
.dlg-avatar { border: 3px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
.dlg-name { font-size: 18px; font-weight: 700; color: #344054; margin: 12px 0 6px; text-align: center; }
.dlg-badges { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; margin-bottom: 8px; }
.dlg-org { font-size: 13px; color: #667085; text-align: center; margin-bottom: 6px; }
.dlg-location { font-size: 13px; color: #9099A6; margin-bottom: 12px; }
.dlg-contacts { width: 100%; padding: 0 20px; display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.dlg-contacts div { font-size: 13px; color: #344054; }
.privacy-shield-tip {
  background: #F4F3FF;
  border: 1px solid rgba(134,121,251,0.22);
  border-radius: 8px;
  color: #8679FB !important;
  line-height: 1.6;
  padding: 10px 12px;
}
.resume-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: #8679FB; color: #fff; text-decoration: none;
  padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 600;
  margin-top: 4px;
}
.resume-btn:hover { background: #7468e8; }

/* 右栏 */
.dlg-right {
  flex: 1; background: #F8F9FA; padding: 28px 28px 28px 24px;
  overflow-y: auto; display: flex; flex-direction: column; gap: 20px;
  border-radius: 0 12px 12px 0;
}
.dlg-block { background: #fff; border-radius: 10px; padding: 16px 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.dlg-block-title { font-size: 13px; font-weight: 700; color: #344054; margin-bottom: 12px; }
.dlg-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.dlg-topic-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.dlg-topic-text { font-size: 14px; color: #344054; }
.dlg-intro-quote {
  font-size: 14px; color: #344054; line-height: 1.8; white-space: pre-wrap;
  border-left: 3px solid #8679FB; padding-left: 14px; max-height: 280px; overflow-y: auto;
}

.empty-tip { text-align: center; color: #9099A6; padding: 48px 0; font-size: 14px; }
</style>
