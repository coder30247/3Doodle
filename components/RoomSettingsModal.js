// components/RoomSettingsModal.js
import UsernameInput from './UserNameInput';
import CreateRoomButton from './CreateRoomButton';
import JoinRoomForm from './JoinRoomForm';

export default function RoomSettingsModal() {
  return (
    <div>
      <UsernameInput />
      <CreateRoomButton />
      <JoinRoomForm />
    </div>
  );
}
