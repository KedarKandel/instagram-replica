import { useAuth } from "@/src/hooks/useAuth";
import { storage } from "@/src/services/firebase";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import {
  ActivityIndicator, Alert,
  Image,
  StyleSheet,
  Text, TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function EditProfile() {
  const { user, updateUserProfile, isLoading } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [image, setImage] = useState<string | null>(user?.image ?? null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permission needed", "Allow photo access"); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, quality: 0.8
    });
    if (!res.canceled) setImage(res.assets[0].uri);
  };

  const onSave = async () => {
    if (!user) return;
    try {
      setUploading(true);
      let url = image;
      if (url && url.startsWith("file://")) {
        const blob = await (await fetch(url)).blob();
        const r = ref(storage, `avatars/${user.uid}.jpg`);
        await uploadBytes(r, blob);
        url = await getDownloadURL(r);
      }
      await updateUserProfile(name.trim(), url ?? undefined);
      Alert.alert("Saved", "Profile updated");
    } catch (e:any) {
      Alert.alert("Error", e.message ?? "Failed to update profile");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.avatarWrap}>
        <Image
          source={{ uri: image ?? "https://cdn-icons-png.flaticon.com/512/847/847969.png" }}
          style={styles.avatar}
        />
        <Text style={styles.link}>Change Photo</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Display name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        style={styles.input}
      />
      <TouchableOpacity
        onPress={onSave}
        disabled={uploading || isLoading}
        style={[styles.btn, (uploading||isLoading) && {opacity:0.7}]}
      >
        {uploading || isLoading ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnTxt}>Save</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:"#fff", padding:20 },
  avatarWrap:{ alignItems:"center", marginBottom:20 },
  avatar:{ width:100, height:100, borderRadius:50 },
  link:{ marginTop:8, color:"#0095f6", fontWeight:"600" },
  label:{ fontSize:16, fontWeight:"500", marginBottom:6 },
  input:{ borderWidth:1, borderColor:"#ddd", borderRadius:8, padding:12, marginBottom:20, fontSize:16 },
  btn:{ backgroundColor:"#0095f6", paddingVertical:14, borderRadius:8, alignItems:"center" },
  btnTxt:{ color:"#fff", fontWeight:"700", fontSize:16 }
});
