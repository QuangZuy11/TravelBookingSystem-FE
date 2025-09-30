import React, { useState } from 'react';
import './TourDetails.css';

const TourDetails = () => {
  const [tourData, setTourData] = useState({
    name: 'Trekking Sapa - Fansipan 3N2Đ',
    location: 'Sapa, Lào Cai',
    price: '3200000',
    duration: '3',
    maxParticipants: '12',
    description: 'Chinh phục đỉnh Fansipan và khám phá văn hóa dân tộc thiểu số',
    highlights: [
      'Chinh phục đỉnh Fansipan',
      'Thăm bản Cat Cat',
      'Trải nghiệm văn hóa H\'Mong',
      'Khám phá ruộng bậc thang'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Hà Nội - Sapa',
        activities: [
          'Khởi hành từ Hà Nội',
          'Check-in khách sạn tại Sapa',
          'Thăm quan bản Cat Cat'
        ]
      },
      {
        day: 2,
        title: 'Chinh phục Fansipan',
        activities: [
          'Đi cáp treo lên Fansipan',
          'Chinh phục đỉnh núi',
          'Ăn trưa trên núi'
        ]
      },
      {
        day: 3,
        title: 'Khám phá Sapa - Hà Nội',
        activities: [
          'Thăm chợ Sapa',
          'Mua sắm đặc sản',
          'Trở về Hà Nội'
        ]
      }
    ],
    images: [
      '/path/to/image1.jpg',
      '/path/to/image2.jpg',
      '/path/to/image3.jpg'
    ]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Tour data:', tourData);
  };

  const handleImageUpload = (e) => {
    // Handle image upload
    console.log('File uploaded:', e.target.files[0]);
  };

  return (
    <div className="tour-details">
      <div className="tour-header">
        <h2>{tourData.name}</h2>
        <button className="save-button" onClick={handleSubmit}>Save Changes</button>
      </div>

      <div className="tour-content">
        <div className="main-info">
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label>Tour Name</label>
              <input
                type="text"
                value={tourData.name}
                onChange={(e) => setTourData({...tourData, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={tourData.location}
                onChange={(e) => setTourData({...tourData, location: e.target.value})}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Price (VND)</label>
                <input
                  type="number"
                  value={tourData.price}
                  onChange={(e) => setTourData({...tourData, price: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Duration (Days)</label>
                <input
                  type="number"
                  value={tourData.duration}
                  onChange={(e) => setTourData({...tourData, duration: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Max Participants</label>
                <input
                  type="number"
                  value={tourData.maxParticipants}
                  onChange={(e) => setTourData({...tourData, maxParticipants: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Description</h3>
            <textarea
              value={tourData.description}
              onChange={(e) => setTourData({...tourData, description: e.target.value})}
              rows="4"
            />
          </div>

          <div className="form-section">
            <h3>Tour Highlights</h3>
            <div className="highlights-container">
              {tourData.highlights.map((highlight, index) => (
                <div key={index} className="highlight-item">
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => {
                      const newHighlights = [...tourData.highlights];
                      newHighlights[index] = e.target.value;
                      setTourData({...tourData, highlights: newHighlights});
                    }}
                  />
                  <button
                    onClick={() => {
                      const newHighlights = tourData.highlights.filter((_, i) => i !== index);
                      setTourData({...tourData, highlights: newHighlights});
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                className="add-button"
                onClick={() => setTourData({
                  ...tourData,
                  highlights: [...tourData.highlights, '']
                })}
              >
                + Add Highlight
              </button>
            </div>
          </div>

          <div className="form-section">
            <h3>Itinerary</h3>
            <div className="itinerary-container">
              {tourData.itinerary.map((day, index) => (
                <div key={index} className="itinerary-day">
                  <div className="day-header">
                    <h4>Day {day.day}</h4>
                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) => {
                        const newItinerary = [...tourData.itinerary];
                        newItinerary[index].title = e.target.value;
                        setTourData({...tourData, itinerary: newItinerary});
                      }}
                      placeholder="Day Title"
                    />
                  </div>
                  <div className="activities-list">
                    {day.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="activity-item">
                        <input
                          type="text"
                          value={activity}
                          onChange={(e) => {
                            const newItinerary = [...tourData.itinerary];
                            newItinerary[index].activities[actIndex] = e.target.value;
                            setTourData({...tourData, itinerary: newItinerary});
                          }}
                        />
                        <button
                          onClick={() => {
                            const newItinerary = [...tourData.itinerary];
                            newItinerary[index].activities = day.activities.filter((_, i) => i !== actIndex);
                            setTourData({...tourData, itinerary: newItinerary});
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      className="add-button"
                      onClick={() => {
                        const newItinerary = [...tourData.itinerary];
                        newItinerary[index].activities.push('');
                        setTourData({...tourData, itinerary: newItinerary});
                      }}
                    >
                      + Add Activity
                    </button>
                  </div>
                </div>
              ))}
              <button
                className="add-button"
                onClick={() => {
                  const newDay = {
                    day: tourData.itinerary.length + 1,
                    title: '',
                    activities: ['']
                  };
                  setTourData({
                    ...tourData,
                    itinerary: [...tourData.itinerary, newDay]
                  });
                }}
              >
                + Add Day
              </button>
            </div>
          </div>

          <div className="form-section">
            <h3>Tour Images</h3>
            <div className="images-container">
              {tourData.images.map((image, index) => (
                <div key={index} className="image-item">
                  <img src={image} alt={`Tour ${index + 1}`} />
                  <button
                    onClick={() => {
                      const newImages = tourData.images.filter((_, i) => i !== index);
                      setTourData({...tourData, images: newImages});
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="image-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  id="image-upload"
                />
                <label htmlFor="image-upload">+ Add Image</label>
              </div>
            </div>
          </div>
        </div>

        <div className="side-panel">
          <div className="preview-section">
            <h3>Preview</h3>
            {/* Add preview content here */}
          </div>
          <div className="status-section">
            <h3>Tour Status</h3>
            <select>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetails;