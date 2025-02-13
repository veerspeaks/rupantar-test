import { FC } from "react";

interface VirtualTryOnSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const VirtualTryOnSidePanel: FC<VirtualTryOnSidePanelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="side-panel-overlay" onClick={onClose}>
      <div className="side-panel-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <div className="panel-content">
          <p>We are good to go!</p>
        </div>
      </div>
      <style jsx>{`
        .side-panel-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.3);
          display: flex;
          justify-content: flex-end;
          z-index: 1000;
        }
        .side-panel-container {
          background: white;
          width: 300px;
          height: 100%;
          padding: 20px;
          box-shadow: -2px 0 5px rgba(0, 0, 0, 0.3);
          position: relative;
        }
        .close-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }
        .panel-content {
          margin-top: 40px;
          text-align: center;
          font-size: 18px;
        }
      `}</style>
    </div>
  );
};

export default VirtualTryOnSidePanel;