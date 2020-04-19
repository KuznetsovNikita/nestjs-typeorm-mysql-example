USE testdb;

DELETE from thanks;
DROP PROCEDURE IF EXISTS loadTestData;

DELIMITER //

CREATE PROCEDURE loadTestData()
BEGIN
  DECLARE user INT DEFAULT 1;
  DECLARE reason INT DEFAULT 0;
  DECLARE toUserId VARCHAR(16);
  DECLARE fromUserId VARCHAR(16);

  WHILE user <= 2 DO
    SET toUserId = CONCAT('user-', user);

    WHILE reason <= 9 DO
      INSERT INTO thanks VALUES(CONCAT(toUserId, '#00000', reason), fromUserId, toUserId, CONCAT('reason-', reason));
      SET reason = reason + 1;
    END WHILE;
    
    SET user = user + 1;
    SET reason = 0;
    set fromUserId = toUserId;
  END WHILE;
  
END;
//

DELIMITER ;

CALL loadTestData();


