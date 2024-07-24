import React from "react";

function EditProfilePage() {
  return (
    <div>
      <h2>Edit Profile</h2>
      <form>
        <input type="text" placeholder="Display Name" />
        <textarea placeholder="Bio"></textarea>
        <input type="file" />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}

export default EditProfilePage;
