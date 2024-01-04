<script setup>
import { getCurrentInstance } from "vue";
import avatar1 from "@images/avatars/avatar-1.png";

const dataUser = JSON.parse(localStorage.getItem("userData"));
const instance = getCurrentInstance();

async function logout() {
  try {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userData");

    if (instance && instance.proxy.$keycloak) {
      let logoutOptions = { redirectUri: window.location.origin };
      await instance.proxy.$keycloak.logout(logoutOptions);
    }
  } catch (error) {
    console.error(error);
  }
}
</script>

<template>
  <VBadge dot location="bottom right" offset-x="3" offset-y="3" bordered color="success">
    <VAvatar class="cursor-pointer" color="primary" variant="tonal">
      <VImg :src="avatar1" />
      <VMenu activator="parent" width="230" location="bottom end" offset="14px">
        <VList>
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge dot location="bottom right" offset-x="3" offset-y="3" color="success">
                  <VAvatar color="primary" variant="tonal">
                    <VImg :src="avatar1" />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>
            <VListItemTitle class="font-weight-semibold">
              {{ dataUser.nombre }}
            </VListItemTitle>
            <VListItemSubtitle>{{ dataUser.rol_usuario }}</VListItemSubtitle>
          </VListItem>
          <VDivider class="my-2" />
          <VListItem @click="logout">
            <template #prepend>
              <VIcon class="me-2" icon="tabler-logout" size="22" />
            </template>
            <VListItemTitle>Cerrar Sesión</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
    </VAvatar>
  </VBadge>
</template>
