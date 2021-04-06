export default function Signup() {
  return (
    <div>
      <h1>Rigister for an accout</h1>
      <form>
        <div>
          <label>Username</label>
          <input type="text" />
        </div>
        <div>
          <label>EmployeeID</label>
          <input type="text" />
        </div>
        <div>
          <label>E-mail</label>
          <input type="text" />
        </div>
        <div>
          <label>Password</label>
          <input type="text" />
        </div>
        <div>
          <label>ID card</label>
          <input type="text" />
        </div>
        <div>
          <button type="submit">Signup</button>
          <a href="/login">Cancel</a>
        </div>
      </form>
    </div>
  );
}
