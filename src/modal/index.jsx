import ReactDOM from "react-dom/client";
import Modal from "@/modal/Modal";
import ss from "good-storage";

const modalVersion = ss.get("ModalVersion","0")
if(Number(modalVersion)<Number(__BUILD_VERSION__)){
    const modalDom = document.getElementById('modal')
    const modal = ReactDOM.createRoot(modalDom)
    modal.render(<>
        <Modal/>
    </>)
}
